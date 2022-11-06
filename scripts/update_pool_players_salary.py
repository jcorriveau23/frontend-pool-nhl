# This script will be run daily to update the team of each player stored inside pools. 
# We store the players into each pools to reduce the number of read into the database.

from pymongo import MongoClient
from datetime import date, datetime, timedelta
import requests
import json
from bs4 import BeautifulSoup
import unidecode

dict_CF_name_to_nhl_name = {
    "Josh Norris": "Joshua Norris",
    "Zach Werenski": "Zachary Werenski",
    "Matty Beniers": "Matthew Beniers",
    "Tony DeAngelo": "Anthony Deangelo",
    "Tim Stützle": "Tim Stutzle",
}

CF_team = ['ducks', 
            'flames', 
            'oilers', 
            'kings', 
            'sharks', 
            'kraken', 
            'canucks', 
            'goldenknights', 
            'coyotes',
            'blackhawks',
            'avalanche',
            'stars',
            'wild',
            'predators',
            'blues',
            'jets',
            'bluejackets',
            'devils',
            'islanders',
            'hurricanes',   # Sebastien Aho dupplicate name problem... Need to use team also as key for player.
            'rangers',
            'flyers',
            'penguins',
            'capitals',
            'bruins',
            'sabres',
            'redwings',
            'panthers',
            'canadiens',
            'senators',
            'lightning',
            'mapleleafs'
            ]

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.pooljdope

def parse_roster_table(table, dict_players_salary):
    for row in table:

        cols = row.find_all("td")

        if (len(cols) == 0):
            continue

        name = cols[0].text

        if "," not in name or "(" in name:  # not a player on this condition
            continue

        if ' "C"' in name or ' "A"' in name:    # remove captain or assistant to the name
            name = name[:-4]

        names = name.split(", ")

        name = unidecode.unidecode(f"{names[1]} {names[0]}") # {first} {last}

        caps = []
        for i in range(5):  # parse the following 5 years
            cap = cols[8 + i].text.split("$")
            if len(cap) > 1:
                caps.append(int(cap[1].replace(',', '')))

        dict_players_salary[name] = caps

def update_salary():
    dict_players_salary = {}

    #1) scrape every players current cap hit and create a dictionnary with it. (name -> cap hit) 
    #   (ideally would be id -> cap hit but we cannot since CF do not have the id of nhl api.)

    for team in CF_team:
        print(team)
        url = f"https://www.capfriendly.com/teams/{team}"

        res = requests.get(url)
        soup = BeautifulSoup(res.content, 'lxml')
        tables = soup.find_all('table')
        
        parse_roster_table(tables[1], dict_players_salary)  # Roster table
        parse_roster_table(tables[2], dict_players_salary)  # Not roster table
    
    #2) parse the list of pools
    #3) parse the list of participants into the pool context
    #4) parse the list of players
    #7) update the player caps

    for pool in db.pools.find():
        if pool["context"] is None or pool["context"]["pooler_roster"] is None:
            continue

        for participant in pool["context"]["pooler_roster"]:
            for players_type_key in ["chosen_forwards", "chosen_defenders", "chosen_goalies", "chosen_reservists"]:
                for i, player in enumerate(pool["context"]["pooler_roster"][participant][players_type_key]):
                    # print(player)
                    name = player["name"]

                    if dict_CF_name_to_nhl_name.get(name) is not None:
                        name = dict_CF_name_to_nhl_name.get(name)

                    if dict_players_salary.get(name) is None:
                        # empty salary
                        pool["context"]["pooler_roster"][participant][players_type_key][i]["caps"] = []
                        print(f"{name} not found in dict")
                    else:
                        pool["context"]["pooler_roster"][participant][players_type_key][i]["caps"] = dict_players_salary[name]
                        print(f"{name} - {dict_players_salary[name]}.")

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.pooler_roster": pool["context"]["pooler_roster"]}}, upsert=True)

if __name__ == "__main__":
    update_salary()





