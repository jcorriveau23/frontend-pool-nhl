# This script fetch the same of every teams that exist in the nhl api database and prints the result in a file.

import requests
import json
from bs4 import BeautifulSoup

API_URL = 'https://widgets.sports-reference.com/wg.fcgi?css=1&site=hr&url=%2Ffriv%2Finjuries.cgi&div=div_injuries'

def fetch_injured_players():
    injured_players = {}

    response = requests.request('GET', API_URL)
    data = BeautifulSoup(response.text, 'lxml')

    for row in data.table.tbody.find_all("tr"):
        player_injury_info = row.find_all("td")
        player_injury_name = row.find_all("th")

        injured_players[player_injury_name[0].a.text] = {
            "team": player_injury_info[0].text,
            "date": player_injury_info[1].text,
            "type": player_injury_info[2].text,
            "recovery": player_injury_info[3].text,
        }

    file = open("./client/public/injury.json", "w+")
    json.dump(injured_players, file, indent=4)
    file.close()