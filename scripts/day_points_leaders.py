# This scripts fetch live game data to list the best pointers of the day live.
# It store the information in the day_leaders collection in the mongoDB database.

from pymongo import MongoClient
from datetime import date, datetime, timedelta
import requests
import json
import time

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.hockeypool

day_leaders = db.day_leaders
played = db.played

API_URL = 'https://statsapi.web.nhl.com'

def get_day_leaders_data(day):
    day_leaders_data = day_leaders.find_one({"date": str(day)})
    if day_leaders_data is None:
        day_leaders_data = {
            'date': str(day),
            "skaters": [],
            "goalies": []
            }

    return day_leaders_data

def get_played_data(day):
    played_data = played.find_one({"date": str(day)})
    if played_data is None:
        played_data = {
            'date': str(day),
            "players": []
            }
    return played_data

def update_skaters_stats(day_leaders_data, p):
    for player in day_leaders_data["skaters"]:
        if player["id"] == p["id"]:
            player["stats"] = p["stats"]
            return
    
    day_leaders_data["skaters"].append(p)

def remove_skaters_stats(day_leaders_data, id):
    for player in day_leaders_data["skaters"]:
        if player["id"] == id:
            print(f"TEST: {player}")
            day_leaders_data["skaters"].remove(player)
            return

def update_goalies_stats(day_leaders_data, p):
    for player in day_leaders_data["goalies"]:
        if player["id"] == p["id"]:
            player["stats"] = p["stats"]
            return
    
    day_leaders_data["goalies"].append(p)

def fetch_pointers_day(day = None):
    live_game_info = {} # contains the live game time information that gets updated each 3 min.

    if day is None:
        if datetime.now().hour < 12:
            day = date.today() - timedelta(days=1)
        else:
            day = date.today()

    day_leaders_data = get_day_leaders_data(day)
    played_data = get_played_data(day)

    live_game_info["date"] = str(day)

    TODAY_GAME_END_POINT = f'/api/v1/schedule?startDate={day}&endDate={day}'

    response = requests.request('GET', API_URL + TODAY_GAME_END_POINT)  # fetch all todays games
    today_games = json.loads(response.text)

    if len(today_games["dates"]) == 0:
        return  # There is no game on that date!

    number_of_games = len(today_games['dates'][0]['games'])

    print(f'fetching for: {day}, there is {number_of_games} games')

    isLiveGame = False

    for game in today_games['dates'][0]['games']:
        hasOT = False # tell if the game has been in shootout.
        win_processed = False   # tell if the win has been processed to the goaly.
        loss_processed = False  # tell if the loss has been processed to the goaly.
        print(game)

        gameID = game['gamePk']
        gameState = game['status']['abstractGameState']

        if game['gameType'] != "R" and game['gameType'] != "P":
            print(f"Skip the game! | Game Type: {game['gameType']}")
            continue

        if gameState != "Live" and gameState != "Final":
            print(f"Skip the game! | gameState: {gameState}")
            continue     # fetch the game stats until there is no more update

        if gameID in fetch_pointers_day.end_games:
            print(f"Skip the game! | Game Ended: {gameID}")
            continue

        print(f'Game: {gameID},  State: {gameState}')

        isLiveGame = True

        GAME_DATA_END_POINT = f'/api/v1/game/{gameID}/feed/live'
        response = requests.request('GET', API_URL + GAME_DATA_END_POINT)   # fetch the live game data
        live_game = json.loads(response.text)
        if gameState == 'Live':
            live_game_info[gameID] = {  
                                        "period": live_game["liveData"]["linescore"]["currentPeriodOrdinal"],
                                        "time": live_game["liveData"]["linescore"]["currentPeriodTimeRemaining"]
                                        }

        # When OT happens in the game we need to process the losing goalies points.

        if live_game['liveData']['linescore']['currentPeriod'] > 3:
            hasOT = True

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

                if "fullName" not in player['person']:
                    continue    # should never happen in a regular game.

                if 'skaterStats' in player['stats']:
                    isShootoutPoints = False

                    if player["person"]["id"] in shootout:
                        player['stats']['skaterStats']["shootoutGoals"] = shootout[player["person"]["id"]]    # Shootout
                        isShootoutPoints += 1
                    else:
                        player['stats']['skaterStats']["shootoutGoals"] = 0   # Shootout


                    if isShootoutPoints or player['stats']['skaterStats']['goals'] > 0 or player['stats']['skaterStats']['assists'] > 0: 

                        player_name = player['person']['fullName']
                        player_pts = player['stats']['skaterStats']['goals'] + player['stats']['skaterStats']['assists']

                        print(f'{player_name} | {player_pts} pts')

                        update_skaters_stats(day_leaders_data, {
                            'name': player_name, 
                            'id': player['person']['id'],
                            'team': teams[side]['team']['id'],
                            'stats': player['stats']['skaterStats']
                        })
                    else:
                        # Remove in case the player was given a points falsely.
                        remove_skaters_stats(day_leaders_data, player['person']['id'])


                    if player['stats']['skaterStats']['timeOnIce'] != '0:00':
                        if player['person']['id'] not in played_data["players"]:
                            played_data["players"].append(player['person']['id'])

                elif 'goalieStats' in player['stats']:
                    if player['stats']['goalieStats']['timeOnIce'] != '0:00':
                        player_name = player['person']['fullName']

                        print(f'{player_name} | goalies')

                        if hasOT:
                            player['stats']['goalieStats']['OT'] = True

                        update_goalies_stats(day_leaders_data, {
                            'name': player_name, 
                            'id': player['person']['id'],
                            'team': teams[side]['team']['id'],
                            'stats': player['stats']['goalieStats']
                        })

                        if 'decision' in player['stats']['goalieStats'] and player['stats']['goalieStats']['decision'] == 'W':
                            win_processed = True

                        if 'decision' in player['stats']['goalieStats'] and player['stats']['goalieStats']['decision'] == 'L':
                            loss_processed = True

                        played_data["players"].append(player['person']['id'])
        if win_processed and loss_processed:              
            fetch_pointers_day.end_games.append(gameID)
                        
        
        day_leaders.update_one({'date': str(day)}, {'$set': day_leaders_data}, upsert=True) # upsert = True, to create a new document if not found
        played.update_one({'date': str(day)}, {'$set': played_data}, upsert=True) # upsert = True, to create a new document if not found
            
    # dump the live game 
    
    # debug

    file = open("./client/public/live_game_info.json", "w+")
    json.dump(live_game_info, file, indent=4)
    file.close()

    # release

    file = open("./client/build/live_game_info.json", "w+")
    json.dump(live_game_info, file, indent=4)
    file.close()

    return isLiveGame

fetch_pointers_day.end_games = []

if __name__ == "__main__":
    start_date = date(2023, 2, 11)
    end_date = date.today()
    delta = timedelta(days=1)
    while start_date <= end_date:
        print(start_date)
        fetch_pointers_day(start_date)
        start_date += delta

    # fetch_pointers_day()
    # fetch_pointers_day(date(2022, 10, 31))