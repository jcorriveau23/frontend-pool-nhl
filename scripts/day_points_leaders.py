# This scripts fetch live game data to list the best pointers of the day live.
# It store the information in the day_leaders collection in the mongoDB database.

from pymongo import MongoClient
from datetime import date, datetime, timedelta
import requests
import json
import time

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.pooljdope

day_leaders = db.day_leaders
played = db.played

API_URL = 'https://statsapi.web.nhl.com'

def fetch_pointers_day(day = None):
    skaters = []
    goalies = []
    played_players = []

    if day is None:
        if datetime.now().hour < 12:
            day = date.today() - timedelta(days=1)
        else:
            day = date.today()

    TODAY_GAME_END_POINT = f'/api/v1/schedule?startDate={day}&endDate={day}'

    response = requests.request('GET', API_URL + TODAY_GAME_END_POINT)  # fetch all todays games
    today_games = json.loads(response.text)

    if len(today_games["dates"]) == 0:
        return

    number_of_games = len(today_games['dates'][0]['games'])

    print(f'fetching for: {day}, there is {number_of_games} games')

    isLiveGame = False

    for game in today_games['dates'][0]['games']:
        # if game['gameType'] != "R" and game['gameType'] != "P":
        #     continue

        gameID = game['gamePk']
        gameState = game['status']['abstractGameState']

        print(f'Game: {gameID},  State: {gameState}')

        print(gameState)

        if gameState == 'Live' or gameState == 'Final':
            isLiveGame = gameState == 'Live'
            gameID = game['gamePk']

            GAME_DATA_END_POINT = f'/api/v1/game/{gameID}/feed/live'
            response = requests.request('GET', API_URL + GAME_DATA_END_POINT)   # fetch the live game data
            live_game = json.loads(response.text)

            # When shootout happened in the game we need to process the number of times each players scores into the shootout.
            shootout = {}
            if live_game['liveData']['linescore']['hasShootout']:

                for i in live_game["liveData"]["plays"]["playsByPeriod"][4]["plays"]:
                    if live_game["liveData"]["plays"]["allPlays"][i]["result"]["eventTypeId"] == 'GOAL':
                        player = live_game["liveData"]["plays"]["allPlays"][i]["players"][0]["player"]["id"]
                        print(f"{player} Scored in shootout!")
                        if player in shootout:
                            shootout[player] += 1
                        else:
                            shootout[player] = 1

            teams = live_game['liveData']['boxscore']['teams']

            for side in teams:
                for id in teams[side]['players']:
                    player = teams[side]['players'][id]

                    if 'skaterStats' in player['stats']:
                        if player["person"]["id"] in shootout:
                            player['stats']['skaterStats']["shootoutGoals"] = shootout[player["person"]["id"]]    # Shootout
                        else:
                            player['stats']['skaterStats']["shootoutGoals"] = 0   # Shootout


                        if player['stats']['skaterStats']['goals'] > 0 or player['stats']['skaterStats']['assists'] > 0: 

                            player_name = player['person']['fullName']
                            player_pts = player['stats']['skaterStats']['goals'] + player['stats']['skaterStats']['assists']

                            print(f'{player_name} | {player_pts} pts')

                            skaters.append({
                                'name': player['person']['fullName'], 
                                'id': player['person']['id'],
                                'team': teams[side]['team']['name'],
                                'stats': player['stats']['skaterStats']
                            })
                        elif player['stats']['skaterStats']['timeOnIce'] != '0:00':
                            played_players.append(player['person']['id'])

                    elif 'goalieStats' in player['stats']:
                        if player['stats']['goalieStats']['timeOnIce'] != '0:00':
                            player_name = player['person']['fullName']

                            print(f'{player_name} | goalies')

                            goalies.append({
                                'name': player['person']['fullName'], 
                                'id': player['person']['id'],
                                'team': teams[side]['team']['name'],
                                'stats': player['stats']['goalieStats']
                            })
                            played_players.append(player['person']['id'])

            day_leaders_data = {
                'date': str(day),
                'skaters': skaters,
                'goalies': goalies                
            }

            played_data = {
                'date': str(day),
                "players": played_players
            }
            
            day_leaders.update_one({'date': str(day)}, {'$set': day_leaders_data}, upsert=True) # upsert = True, to create a new document if not found
            played.update_one({'date': str(day)}, {'$set': played_data}, upsert=True) # upsert = True, to create a new document if not found

    return isLiveGame

if __name__ == "__main__":
    start_date = date(2022, 9, 24)     # beginning of the 2021-2022 season
    end_date = date.today()
    delta = timedelta(days=1)
    while start_date <= end_date:
        print(start_date)
        fetch_pointers_day(start_date)
        start_date += delta
    #fetch_pointers_day(date(2022, 3, 15))