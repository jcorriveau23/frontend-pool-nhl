# Schedule Library imported
import json
import time
from datetime import date, datetime, timedelta

import requests
import schedule
from pymongo import MongoClient

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.pooljdope
SEASON = '20212022'
API_URL = 'https://statsapi.web.nhl.com'

# This function will fetch live game data to list the best pointers of the day live.
# It store the information in the day_leaders collection in the mongoDB database.
def get_live_day_points_leaders():
    day_leaders = db.day_leaders

    skaters = []
    goalies = []
    
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
        gameID = game['gamePk']
        gameState = game['status']['abstractGameState']

        print(f'Game: {gameID},  State: {gameState}')

        if gameState == 'Live' or gameState == 'Final':
            isLiveGame = gameState == 'Live'    # TODO use this isLiveGame variable to change the period this function is being called from the scheduler
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
 
def daily_players_stats_update():
    print("daily_players_stats_update")
 
# this script will go through each pool in the database and look if there is some trade with status == "ACCEPTED" from yesterday.
# if yes, add the items of each traded to the corresponding poolers. (players in reservist + picks in tradable_picks)
# change the trade status to COMPLETED
# finally save the pool in the database
# this script should run every morning (lets say 5am)
def close_accepted_trade():
    yesterday = date.today() - timedelta(days=1) # TODO change to look only on yesterday 

    for pool in db.pools.find():
        isPoolUpdated = False

        print(pool["name"])
        for trade in pool["trades"]:
            if trade["status"] == "ACCEPTED" and yesterday == trade["dateAccepted"].date(): 
                #print(trade)
                isPoolUpdated = True

                proposedBy = trade["proposedBy"]
                askTo = trade["askTo"]

                fromItems = trade["fromItems"]
                toItems = trade["toItems"]

                # the fromItems are being transfered to the askTo pooler

                for player in fromItems["players"]:
                    pool["context"][askTo]["chosen_reservist"].append(player)

                for pick in fromItems["picks"]:
                    pool["context"][askTo]["tradable_picks"].append(pick)

                # the toItems are being transfered to the proposedBy pooler

                for player in toItems["players"]:
                    pool["context"][proposedBy]["chosen_reservist"].append(player)

                for pick in toItems["picks"]:
                    pool["context"][proposedBy]["tradable_picks"].append(pick)

                # before updating the document in the database set state of the trade to complete.
                trade["status"] = "COMPLETED"
                print("updated one trade")

        # only update when an ACCEPTED trade has been processed

        if isPoolUpdated:
            db.pools.update_one({'_id': pool["_id"]}, {'$set': pool}, upsert=True) # upsert = True, to create a new document if not found
 
# Task scheduling
# After every 3mins get_live_day_points_leaders() is called.
schedule.every(3).minutes.do(get_live_day_points_leaders)
 
# Every day at 05:00 time close_accepted_trade() is called.
schedule.every().day.at("05:00").do(close_accepted_trade)

print("start the scheduling!")
while True:
    # Checks whether a scheduled task
    # is pending to run or not
    schedule.run_pending()
    time.sleep(1)
