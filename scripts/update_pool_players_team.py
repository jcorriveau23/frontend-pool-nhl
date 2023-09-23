# This script will be run daily to update the team of each player stored inside pools. 
# We store the players into each pools to reduce the number of read into the database.

from pymongo import MongoClient
from datetime import date, datetime, timedelta
import requests
import json

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.hockeypool

#1) parse the list of pools
#2) parse the list of participants into the pool context
#3) parse the list of players
#4) for each players fetch the players team using this nhl api call: https://statsapi.web.nhl.com/api/v1/people/8482671
#5) Store the players latest team into a dictionary to avoid calling the same api call on the same players in different pool
#6) update the player teams if it changes

def update_pool_players_team():
    players_id_to_current_team_dict = {}  # This dict will store the player current team to avoid requesting it multiple time

    for pool in db.pools.find():
        if pool["context"] is None or pool["context"]["players"] is None:
            continue

        for player_id in pool["context"]["players"]:
            # print(player)
            if players_id_to_current_team_dict.get(player_id) is None:
                player_url = f'https://statsapi.web.nhl.com/api/v1/people/{player_id}'

                response = requests.request('GET', player_url)
                player_info_json = json.loads(response.text)

                if "currentTeam" not in player_info_json["people"][0]:
                    # The player no more have a current team, we can continue.
                    continue

                player_current_team = player_info_json["people"][0]["currentTeam"]["id"]
                player_current_team_name = player_info_json["people"][0]["currentTeam"]["name"]
                players_id_to_current_team_dict[player_id] = player_current_team
            else:
                player_current_team = players_id_to_current_team_dict[player_id]
            
            if pool["context"]["players"][str(player_id)]["team"] != player_current_team: # player got traded.
                pool["context"]["players"][str(player_id)]["team"] = player_current_team
                print("{} got traded to the {}.".format(pool["context"]["players"][str(player_id)]["name"], player_current_team_name))

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.players": pool["context"]["players"]}}, upsert=True)
                    

if __name__ == "__main__":
    update_pool_players_team()