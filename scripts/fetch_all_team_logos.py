# This script fetch the same of every teams that exist in the nhl api database and prints the result in a file.

import requests
import json

API_URL = 'https://records.nhl.com/site/api/franchise'
# https://records.nhl.com/site/api/franchise?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName

TEAM_LIST_URL = API_URL + '?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName'

dict_team_logo = {}
dict_team_abbrev_to_team_id = {}

response = requests.request('GET', TEAM_LIST_URL)
team_response_json = json.loads(response.text)

for team in team_response_json["data"]:
    for t in team["teams"]:
        print(t)
        dict_team_logo[t['id']] = t['logos'][-1]['secureUrl'] # latest logo
        dict_team_abbrev_to_team_id[t['triCode']] = t['id']

print(json.dumps(dict_team_logo, indent=4))

with open("scripts/teams_logos.json", "w") as file:
    json.dump(dict_team_logo, file, indent=4)

with open("scripts/teams_abbrev_to_team_id.json", "w") as file:
    json.dump(dict_team_abbrev_to_team_id, file, indent=4)
