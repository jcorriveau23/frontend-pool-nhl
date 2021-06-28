from pymongo import MongoClient
import requests
import json

# create an client instance of the
# MongoDB class
mo_c = MongoClient()

# create an instance of 'some_database'
db = mo_c.pooljdope
players = db.players

SEASON = '20202021'
API_URL = 'https://statsapi.web.nhl.com'

TEAM_LIST_URL = API_URL + '/api/v1/teams'

response = requests.request('GET', TEAM_LIST_URL)

team_list_response_json = json.loads(response.text)


for team in team_list_response_json["teams"]:
    print(team)

    team_name = team["name"]
    team_roaster_url = team["link"]

    roaster_list_url = API_URL + team_roaster_url + '/roster?rosterType=fullRoster'

    response = requests.request('GET', roaster_list_url)
    roaster_list_response_json = json.loads(response.text)

    try:
        roaster_list_response_json["roster"]
    except:
        pass
    else:
        for player in roaster_list_response_json["roster"]:

            player_url = API_URL + player["person"]["link"] + '/stats?stats=statsSingleSeason&season=' + SEASON
            response = requests.request('GET', player_url)
            player_stats_json = json.loads(response.text)

            if player["position"]["code"] == "R" or player["position"]["code"] == "L" or player["position"]["code"] == "C":
                position = "F"
            else:
                position = player["position"]["code"]
            try:
                p = {"name": player["person"]["fullName"],
                     "team": team_name,
                     "stats": player_stats_json["stats"][0]["splits"][0]["stat"],
                     "url": player["person"]["link"],
                     "position": position
                     }
                if position == "F" or position == "D":
                    p['stats']['pts'] = p['stats']['goals'] + p['stats']['assists']
                else:
                    p['stats']['goals'] = 0
                    p['stats']['assist'] = 0
                    p['stats']['pts'] = 0


            except:
                print(player["person"]["fullName"] + " Position: " + position)
                print(player_stats_json["stats"][0]["splits"])
                p = {"name": player["person"]["fullName"],
                     "team": team_name,
                     "stats": {"games": 0, "goals": 0, "assists": 0, 'pts': 0},
                     "url": player["person"]["link"],
                     "position": position
                     }

            # TODO, fetch data from mongo and store the difference to note how much points this player did yesterday
            # Create the summary day from last night games (10 best scorer, 10 best points maker, etc...)
            players.update_one({"url": player["person"]["link"]}, {"$set": p}, upsert=True) # upsert = True, to create a new document if not found
