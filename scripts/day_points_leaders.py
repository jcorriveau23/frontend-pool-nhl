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

SEASON = '20212022'
API_URL = 'https://statsapi.web.nhl.com'

def fetch_pointers_day(day):
    skaters = []
    goalies = []

    TODAY_GAME_END_POINT = f'/api/v1/schedule?startDate={day}&endDate={day}'

    response = requests.request('GET', API_URL + TODAY_GAME_END_POINT)  # fetch all todays games
    today_games = json.loads(response.text)

    if len(today_games["dates"]) == 0:
        return

    number_of_games = len(today_games['dates'][0]['games'])

    print(f'fetching for: {day}, there is {number_of_games} games')

    isLiveGame = False

    for game in today_games['dates'][0]['games']:
        gameID = game['gamePk']
        gameState = game['status']['abstractGameState']

        print(f'Game: {gameID},  State: {gameState}')

        if gameState == 'Live' or gameState == 'Final':
            isLiveGame = gameState == 'Live'
            gameID = game['gamePk']

            GAME_DATA_END_POINT = f'/api/v1/game/{gameID}/feed/live'
            response = requests.request('GET', API_URL + GAME_DATA_END_POINT)   # fetch the live game data
            live_game = json.loads(response.text)

            teams = live_game['liveData']['boxscore']['teams']

            for side in teams:
                for id in teams[side]['players']:
                    player = teams[side]['players'][id]

                    if 'skaterStats' in player['stats']:
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

            data = {
                'date': str(day),
                'skaters': skaters,
                'goalies': goalies                
            }

            day_leaders.update_one({'date': str(day)}, {'$set': data}, upsert=True) # upsert = True, to create a new document if not found

# fetch all day stats for the past 60 days
for i in range(60):
    day = date.today() - timedelta(days=i)
    fetch_pointers_day(day)

# while True:
#        
#     if datetime.now().hour < 12:
#         day = date.today() - timedelta(days=1)
#     else:
#         day = date.today()
    
#     fetch_pointers_day(day)

#     if(isLiveGame):
#         time.sleep(180) # fetch live games stats every 3 minutes.
#     else:
#         time.sleep(1200) # when no live game fetch every 20 minutes


