import requests
import json

season = '20192020'
api_url = 'https://statsapi.web.nhl.com'

team_list_url = api_url + '/api/v1/teams'

response = requests.request('GET', team_list_url)

team_list_response_json = json.loads(response.text)
count = 0

defense_list = []
forward_list = []
goltender_list = []
na_list = []
for team in team_list_response_json["teams"]:

    team_name = team["name"]
    team_roaster_url = team["link"]

    roaster_list_url = api_url + team_roaster_url + '/roster'

    response = requests.request('GET', roaster_list_url)
    roaster_list_response_json = json.loads(response.text)

    for player in roaster_list_response_json["roster"]:

        player_url = api_url + player["person"]["link"] + '/stats?stats=statsSingleSeason&season=' + season
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

database = {"Def": defense_list, "For": forward_list, "Gol": goltender_list, "N/A": na_list}

with open('database.json', 'w') as file:
    file.write(json.dumps(database))

print("data fetch successfully")
