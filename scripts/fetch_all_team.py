# This script fetch the same of every teams that exist in the nhl api database and prints the result in a file.

import requests
import json

API_URL = 'https://statsapi.web.nhl.com'

TEAM_LIST_URL = API_URL + '/api/v1/teams'

dict_teams = {}

file = open("scripts/teams.json", "w")

for i in range(1, 102):
    response = requests.request('GET', TEAM_LIST_URL + "/{}".format(i))
    team_response_json = json.loads(response.text)
    try:
        print("{} -> {}".format(i, team_response_json["teams"][0]["name"]))
        dict_teams[i] = team_response_json["teams"][0]["name"]
    except:
        pass

json.dump(dict_teams, file, indent=4)
file.close()
