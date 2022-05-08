# This script is made to be fetch daily. We go into all active players to update their stats in the database.
# TODO should only go into the day_points_leader stored in the yesterday database to limit the numbers of call made to the nhl api.

from pymongo import MongoClient
import requests
import json

# create an client instance of the MongoDB class
mo_c = MongoClient()
db = mo_c.pooljdope

# TODO use a parameters input for that script for draft mode fetching. Fetch fullRoster and create 3 database for each role.

# draft_forwards = db.draft_forwards
# draft_defenders = db.draft_defenders
# draft_goalies = db.draft_goalies
players = db.players

SEASON = '20212022'
API_URL = 'https://statsapi.web.nhl.com'

TEAM_LIST_URL = API_URL + '/api/v1/teams'

response = requests.request('GET', TEAM_LIST_URL)

team_list_response_json = json.loads(response.text)


for team in team_list_response_json["teams"]:
    print(team)

    team_name = team["name"]
    team_roaster_url = team["link"]

    roaster_list_url = API_URL + team_roaster_url + '/roster' # fetch the roaster
    # roaster_list_url = API_URL + team_roaster_url + '/roster?rosterType=fullRoster' # fetch the ful roaster, for draft mode

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
            #print(player)

            if player["position"]["code"] == "R" or player["position"]["code"] == "L" or player["position"]["code"] == "C":
                position = "F"
            else:
                position = player["position"]["code"]
                if position != "D" and position != "G":
                    print("position ??: {}".format(position))

            try:
                p = {"name": player["person"]["fullName"],
                     "team": team_name,
                     "id": player["person"]["id"],
                     "stats": player_stats_json["stats"][0]["splits"][0]["stat"],
                     "url": player["person"]["link"],
                     "position": position
                     }
                if position == "F" or position == "D":
                    if p['stats']['games'] == 0:
                        p['stats']['goals'] = 0
                        p['stats']['assists'] = 0

                    p['stats']['pts'] = p['stats']['goals'] + p['stats']['assists']

                else:
                    if p['stats']['games'] == 0:
                        p['stats']['wins'] = 0
                        p['stats']['losses'] = 0
                        p['stats']['savePercentage'] = 0.0


                    p['stats']['goals'] = 0
                    p['stats']['assist'] = 0
                    p['stats']['pts'] = 0

            except:
                # print(player["person"]["fullName"] + " Position: " + position)
                # print(player_stats_json["stats"][0]["splits"])
                if position == "F" or position == "D":
                    p = {"name": player["person"]["fullName"],
                         "team": team_name,
                         "id": player["person"]["id"],
                         "stats": {"games": 0, "goals": 0, "assists": 0, 'pts': 0},
                         "url": player["person"]["link"],
                         "position": position
                         }
                else:
                    p = {"name": player["person"]["fullName"],
                         "team": team_name,
                         "id": player["person"]["id"],
                         "stats": { "games": 0,
                                    "goals": 0,
                                    "assists": 0,
                                    'pts': 0,
                                    'wins': 0,
                                    'losses': 0,
                                    'savePercentage': 0.0
                                    },
                         "url": player["person"]["link"],
                         "position": position
                         }

            players.update_one({"id": player["person"]["id"]}, {"$set": p}, upsert=True) # upsert = True, to create a new document if not found

            # if position == "F":
            #     draft_forwards.update_one({"id": player["person"]["id"]}, {"$set": p}, upsert=True) # upsert = True, to create a new document if not found
            # elif position == "D":
            #     draft_defenders.update_one({"id": player["person"]["id"]}, {"$set": p}, upsert=True) # upsert = True, to create a new document if not found
            # elif position == "G":
            #     draft_goalies.update_one({"id": player["person"]["id"]}, {"$set": p}, upsert=True) # upsert = True, to create a new document if not found
            # else:
            #     print("not added to data base {}".format(player["person"]["fullName"]))
