# This script fetch the same of every teams that exist in the nhl api database and prints the result in a file.

import requests
import json

API_URL = 'https://records.nhl.com/site/api/franchise'
# https://records.nhl.com/site/api/franchise?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName

TEAM_LIST_URL = API_URL + '?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName'

dict_team_abbrev_to_team_id = {}
dict_team_season_info = {}

response = requests.request('GET', TEAM_LIST_URL)
team_response_json = json.loads(response.text)

for team in team_response_json["data"]:
    for t in team["teams"]:
        # abbrev to team id dict
        dict_team_abbrev_to_team_id[t['triCode']] = t['id']
        
        # team info dict
        dict_team_season_info[t["id"]] = {
            "logo": t['logos'][-1]['secureUrl'], 
            "fullName": t["fullName"],
            "firstSeason": t["franchiseTeam"][0]["firstSeason"]["id"]}
        last_season = t["franchiseTeam"][0].get("lastSeason")
        if last_season:
            dict_team_season_info[t["id"]]["lastSeason"] = last_season["id"]
        else:
            dict_team_season_info[t["id"]]["lastSeason"] = None


with open("scripts/teams_abbrev_to_team_id.json", "w") as file:
    json.dump(dict_team_abbrev_to_team_id, file, indent=4)

with open("scripts/dict_team_season_info.json", "w") as file:
    json.dump(dict_team_season_info, file, indent=4)
