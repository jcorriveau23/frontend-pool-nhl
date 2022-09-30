# This script fetch the current players injured in the nhl store it in a dictionnary and paste it in a static file inside the public folder.

import requests
import json
from bs4 import BeautifulSoup

API_URL = 'https://www.cbssports.com/nhl/injuries/'

def fetch_injured_players_cbs():
    injured_players = {}

    response = requests.request('GET', API_URL)
    data = BeautifulSoup(response.text, 'lxml')
    for row in data.find_all("table"):
        # print(row)
        players = row.tbody.find_all("tr")
        for player in players:
            tds = player.find_all("td")

            injured_players[player.find_all("a")[1].text] = {
                "position": tds[1].text.strip(),
                "date": tds[2].text.strip(),
                "type": tds[3].text.strip(),
                "recovery": tds[4].text.strip(),
            }
        # print("end of team")

    file = open("./client/public/injury.json", "w+")
    json.dump(injured_players, file, indent=4)
    file.close()

if __name__ == "__main__":
    fetch_injured_players_cbs()