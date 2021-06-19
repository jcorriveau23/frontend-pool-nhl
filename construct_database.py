import requests
import json

SEASON = '20202021'
API_URL = 'https://statsapi.web.nhl.com'

TEAM_LIST_URL = API_URL + '/api/v1/teams'

response = requests.request('GET', TEAM_LIST_URL)

team_list_response_json = json.loads(response.text)

defense_list = []
forward_list = []
goltender_list = []
na_list = []

for team in team_list_response_json["teams"]:
    print(team)

    team_name = team["name"]
    team_roaster_url = team["link"]

    roaster_list_url = API_URL + team_roaster_url + '/roster?rosterType=fullRoster'

    response = requests.request('GET', roaster_list_url)
    roaster_list_response_json = json.loads(response.text)

    try:
        print(roaster_list_response_json)
        for player in roaster_list_response_json["roster"]:

            player_url = API_URL + player["person"]["link"] + '/stats?stats=statsSingleSeason&season=' + SEASON
            response = requests.request('GET', player_url)
            player_stats_json = json.loads(response.text)
            if player["position"]["code"] == 'D':
                try:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": player_stats_json["stats"][0]["splits"][0]["stat"], "url": player["person"]["link"]}
                    p['stats']['pts'] = p['stats']['goals'] + p['stats']['assists']
                    defense_list.append(p)

                except Exception as e:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": {"games": 0, "goals": 0, "assists": 0, 'pts': 0}, "url": player["person"]["link"],
                         "position": player["position"]["code"]}

                    na_list.append(p)

            elif player["position"]["code"] == 'L' or \
                    player["position"]["code"] == 'R' or \
                    player["position"]["code"] == 'C':

                try:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": player_stats_json["stats"][0]["splits"][0]["stat"],
                         "url": player["person"]["link"], "position": player["position"]["code"]}

                    p['stats']['pts'] = p['stats']['goals'] + p['stats']['assists']
                    forward_list.append(p)

                except Exception as e:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": {"games": 0, "goals": 0, "assists": 0, 'pts': 0}, "url": player["person"]["link"],
                         "position": player["position"]["code"]}

                    na_list.append(p)

            elif player["position"]["code"] == 'G':
                try:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": player_stats_json["stats"][0]["splits"][0]["stat"],
                         "url": player["person"]["link"], "position": player["position"]["code"]}

                    goltender_list.append(p)

                except Exception as e:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": {"games": 0, "goals": 0, "assists": 0, 'pts': 0}, "url": player["person"]["link"],
                         "position": player["position"]["code"]}


                    na_list.append(p)

            else:
                try:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": player_stats_json["stats"][0]["splits"][0]["stat"],
                         "url": player["person"]["link"], "position": player["position"]["code"]}
                    try:
                        p['stats']['pts'] = p['stats']['goals'] + p['stats']['assists']
                    except:
                        pass

                except Exception as e:
                    p = {"name": player["person"]["fullName"], "team": team_name,
                         "stats": {"games": 0, "goals": 0, "assists": 0, 'pts': 0}, "url": player["person"]["link"],
                         "position": player["position"]["code"]}

                na_list.append(p)
    except:
        pass

database = {"Def": defense_list, "For": forward_list, "Gol": goltender_list, "N/A": na_list}

with open('database.json', 'w') as file:
    file.write(json.dumps(database))

print("data fetch successfully")
