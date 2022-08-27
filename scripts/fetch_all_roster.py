# This script will fetch every active players in the nhl and store them in a list inside a json file. 
# The json file will be saved as a static file stored inside the public folder to be accessed during the draft status.

import requests
import json

SEASON = '20212022'
API_URL = 'https://statsapi.web.nhl.com'

TEAM_LIST_URL = API_URL + '/api/v1/teams'

response = requests.request('GET', TEAM_LIST_URL)

team_list_response_json = json.loads(response.text)

players_dict = {
    "F": [],
    "D": [],
    "G": []
}

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
                if position == "F" or position == "D":
                    p = {
                        "name": player["person"]["fullName"],
                        "team": team_name,
                        "id": player["person"]["id"],
                        "stats": {
                            "games": player_stats_json["stats"][0]["splits"][0]["stat"]["games"],
                            "goals": player_stats_json["stats"][0]["splits"][0]["stat"]["goals"],
                            "assists": player_stats_json["stats"][0]["splits"][0]["stat"]["assists"],
                            "pts": player_stats_json["stats"][0]["splits"][0]["stat"]["goals"] + player_stats_json["stats"][0]["splits"][0]["stat"]["assists"]
                        },
                        "url": player["person"]["link"],
                        "position": position
                    }

                    if p['stats']['games'] == 0:
                        p['stats']['goals'] = 0
                        p['stats']['assists'] = 0
                        p['stats']['pts'] = 0

                else:
                    p = {
                        "name": player["person"]["fullName"],
                        "team": team_name,
                        "id": player["person"]["id"],
                        "stats": {
                            "games": player_stats_json["stats"][0]["splits"][0]["stat"]["games"],
                            "goals": 0,
                            "assists": 0,
                            "pts": 0,
                            "wins": player_stats_json["stats"][0]["splits"][0]["stat"]["wins"],
                            "losses": player_stats_json["stats"][0]["splits"][0]["stat"]["losses"],
                            "savePercentage": player_stats_json["stats"][0]["splits"][0]["stat"]["savePercentage"],
                        },
                        "url": player["person"]["link"],
                        "position": position
                    }

                    if p['stats']['games'] == 0:
                        p['stats']['wins'] = 0
                        p['stats']['losses'] = 0
                        p['stats']['savePercentage'] = 0.0

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

            # players.update_one({"id": player["person"]["id"]}, {"$set": p}, upsert=True) # upsert = True, to create a new document if not found

            if position == "F":
                players_dict["F"].append(p)
            elif position == "D":
                players_dict["D"].append(p)
            elif position == "G":
                players_dict["G"].append(p)
            else:
                print("not added to the dict: {}".format(player["person"]["fullName"]))

file = open("./client/public/players.json", "w+")
json.dump(players_dict, file, indent=4)
file.close()