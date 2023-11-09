# this script will go through each pool in the database and cumulate the points of the players if it is not in the reservist. 

from pymongo import MongoClient
from datetime import date, datetime, timedelta

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.hockeypool

def get_skaters_stats(id, today_pointers, played_today):
    for skater in today_pointers["skaters"]:
        if skater["id"] == id:
            if skater["stats"]["shootoutGoals"] > 0:
                return {
                    "G": skater["stats"]["goals"],
                    "A": skater["stats"]["assists"],
                    "SOG": skater["stats"]["shootoutGoals"]
                    }
            else:
                return {
                    "G": skater["stats"]["goals"],
                    "A": skater["stats"]["assists"],
                    }

    for skater in played_today:
        if skater == id:
            return {
                    "G": 0,
                    "A": 0
                    }

def get_goalies_stats(id, today_pointers):
    for goalie in today_pointers["goalies"]:
        if goalie["id"] == id:
            return {
                    "G": goalie["stats"]["goals"], 
                    "A": goalie["stats"]["assists"], 
                    "W": "decision" in goalie["stats"] and goalie["stats"]["decision"] == "W", 
                    "SO": round(goalie["stats"]["savePercentage"], 3) == 1.000 and "decision" in goalie["stats"] and goalie["stats"]["decision"] == "W",
                    "OT": "decision" in goalie["stats"] and goalie["stats"]["decision"] == "L" and "OT" in goalie["stats"] and goalie["stats"]["OT"], 
                    }

def get_db_infos(day):

    today_pointers = db.day_leaders.find_one({"date": str(day)})
    played = db.played.find_one({"date": str(day)})

    return today_pointers, played, day

def cumulate_daily_roster_pts(day = None):
    """
    This function cumulate the daily roster points in the pool.
    This is being ran once a day to update pool database.
    """
    if day is None: # If no time was provided, use the current time.
        day = date.today()
        if datetime.now().hour < 12:    # Before 12h AM, fetch the data from yesterday in the case a game was completed after 12h PM.
            day -= timedelta(days=1)

    today_pointers, played, day = get_db_infos(day)

    if today_pointers is None or played is None:
       print(f"There is no data available for the {str(day)}, no db update will be applied this itteration!")
       return

    if cumulate_daily_roster_pts.last_today_pointers == today_pointers and cumulate_daily_roster_pts.last_played == played:
       print("nothing as changed since the last update, no db update will be applied this itteration!")
       return

    cumulate_daily_roster_pts.last_today_pointers = today_pointers
    cumulate_daily_roster_pts.last_played = played

    for pool in db.pools.find({"status": "InProgress"}):
        if pool["context"]["score_by_day"] is None:
            continue

        score_by_day = pool["context"]["score_by_day"][str(day)]

        for participant in pool["participants"]:
            # Forward
            for key_forward in score_by_day[participant]["roster"]["F"]:
                player_stats = get_skaters_stats(int(key_forward), today_pointers, played["players"])

                if score_by_day[participant]["roster"]["F"][key_forward] and player_stats != score_by_day[participant]["roster"]["F"][key_forward]:
                    name = pool["context"]["players"][key_forward]["name"]
                    past_goals = score_by_day[participant]["roster"]["F"][key_forward].get("G")
                    past_assists = score_by_day[participant]["roster"]["F"][key_forward].get("A")
                    new_goals = score_by_day[participant]["roster"]["F"][key_forward]["G"]
                    new_assists = score_by_day[participant]["roster"]["F"][key_forward]["A"]
                    print(f"Date: {str(day)}, fix: {name}, G: {past_goals} -> {new_goals}, A: {past_assists} -> {new_assists}")
                score_by_day[participant]["roster"]["F"][key_forward] = player_stats



            # Defenders
            for key_defender in score_by_day[participant]["roster"]["D"]:
                player_stats = get_skaters_stats(int(key_defender), today_pointers, played["players"])
                
                if score_by_day[participant]["roster"]["D"][key_defender] and player_stats != score_by_day[participant]["roster"]["D"][key_defender]:
                    name = pool["context"]["players"][key_defender]["name"]
                    past_goals = score_by_day[participant]["roster"]["D"][key_defender].get("G")
                    past_assists = score_by_day[participant]["roster"]["D"][key_defender].get("A")
                    new_goals = score_by_day[participant]["roster"]["D"][key_defender]["G"]
                    new_assists = score_by_day[participant]["roster"]["D"][key_defender]["A"]
                    print(f"Date: {str(day)}, fix: {name}, G: {past_goals} -> {new_goals}, A: {past_assists} -> {new_assists}")

                score_by_day[participant]["roster"]["D"][key_defender] = player_stats
                    
            # Goalies
            for key_goaly in score_by_day[participant]["roster"]["G"]:
                score_by_day[participant]["roster"]["G"][key_goaly] = get_goalies_stats(int(key_goaly), today_pointers)
            
            # Set the is_cumulated value to True so that we know the points has been cumulated.
            score_by_day[participant]["is_cumulated"] = True

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.score_by_day.{str(day)}": score_by_day}}, upsert=True)

cumulate_daily_roster_pts.last_today_pointers = {}
cumulate_daily_roster_pts.last_played = {}

def lock_daily_roster(day = None):
    """
    Lock the daily roster of each pooler. 
    This is the roster that will be allow to cummulate points on that day.
    """
    if day is None:
        day = date.today()

    for pool in db.pools.find({"status": "InProgress"}):
        daily_roster = {}
        for participant in pool["participants"]:
            daily_roster[participant] = {}

            daily_roster[participant] = {"roster": {}, "is_cumulated": False}

            # Forwards

            daily_roster[participant]["roster"]["F"] = {}

            for forward_id in pool["context"]["pooler_roster"][participant]["chosen_forwards"]:
                daily_roster[participant]["roster"]["F"][str(forward_id)] = None

            # Defenders

            daily_roster[participant]["roster"]["D"] = {}

            for defender_id in pool["context"]["pooler_roster"][participant]["chosen_defenders"]:
                daily_roster[participant]["roster"]["D"][str(defender_id)] = None

            # Goalies

            daily_roster[participant]["roster"]["G"] = {}

            for goaly_id in pool["context"]["pooler_roster"][participant]["chosen_goalies"]:
                daily_roster[participant]["roster"]["G"][str(goaly_id)] = None

        if pool["context"]["score_by_day"] is None:
            # when score_by_day is null, at the begginning of the season, we need to initialize it.
            db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.score_by_day": {}}}, upsert=True)

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.score_by_day.{str(day)}": daily_roster}}, upsert=True)


if __name__ == "__main__":
    # start_date = date(2023, 10, 10)     # beginning of the 2021-2022 season
    # end_date = date(2023, 10, 27)
    # delta = timedelta(days=1)
    # while start_date <= end_date:
    #    print(start_date)
    #    lock_daily_roster(start_date)
    #    cumulate_daily_roster_pts(start_date)
    #    start_date += delta

    lock_daily_roster(date(2023, 11, 7))
    cumulate_daily_roster_pts(date(2023, 11, 7))
