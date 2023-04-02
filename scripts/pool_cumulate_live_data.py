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
    for goaly in today_pointers["goalies"]:
        if goaly["id"] == id:
            return {
                    "G": goaly["stats"]["goals"], 
                    "A": goaly["stats"]["assists"], 
                    "W": "decision" in goaly["stats"] and goaly["stats"]["decision"] == "W", 
                    "SO": goaly["stats"]["shots"] == goaly["stats"]["saves"] and "decision" in goaly["stats"] and goaly["stats"]["decision"] == "W",
                    "OT": "decision" in goaly["stats"] and goaly["stats"]["decision"] == "L" and "OT" in goaly["stats"] and goaly["stats"]["OT"], 
                    }

def init_cumulate_dict():
    return {
        # Forwards
        "A_F": 0,
        "HT_F": 0,
        "G_F": 0,
        "SOG_F": 0,     # shootout goals
        "P_F": 0,
        # Defenders
        "G_D": 0,
        "SOG_D": 0,     # shootout goals
        "A_D": 0,
        "HT_D": 0,
        "P_D": 0,
        # Goalies
        "G_G": 0,
        "A_G": 0,
        "W_G": 0,
        "SO_G": 0,
        "OT_G": 0,
        "P_G": 0,
        # Total pts cumulate
        "P": 0
    }

def get_db_infos(day):

    today_pointers = db.day_leaders.find_one({"date": str(day)})
    played = db.played.find_one({"date": str(day)})

    return today_pointers, played, day

def cumulate_daily_roster_pts(day = None):
    if day is None: # If no time was provided, use the current time.
        day = date.today()
        if datetime.now().hour < 12:    # Before 12h AM, fetch the data from yesterday in the case a game was completed after 12h PM.
            day -= timedelta(days=1)

    dict_cumulate = {}

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
            last_day_cumulate = init_cumulate_dict()
            for i in range(1, 20):  # We look through the 20 last day to find the last date 
                past_day = day - timedelta(days=i)
                if str(past_day) in pool["context"]["score_by_day"] and "cumulate" in pool["context"]["score_by_day"][str(past_day)][participant]:
                    last_day_cumulate = pool["context"]["score_by_day"][str(past_day)][participant]["cumulate"]
                    break

            if participant not in dict_cumulate:
                dict_cumulate[participant] = init_cumulate_dict()

            # Forward

            tot_goal = 0
            tot_assist = 0
            tot_hat_trick = 0
            tot_shootout_goals = 0

            for key_forward in score_by_day[participant]["roster"]["F"]:
                # print(score_by_day[participant]["roster"]["F"][key_forward])
                score_by_day[participant]["roster"]["F"][key_forward] = get_skaters_stats(int(key_forward), today_pointers, played["players"])
                if score_by_day[participant]["roster"]["F"][key_forward] is not None:
                    tot_goal += score_by_day[participant]["roster"]["F"][key_forward]["G"]
                    tot_assist += score_by_day[participant]["roster"]["F"][key_forward]["A"]
                    if score_by_day[participant]["roster"]["F"][key_forward]["G"] >= 3:
                        tot_hat_trick += 1
                    if "SOG" in score_by_day[participant]["roster"]["F"][key_forward]:
                        tot_shootout_goals += score_by_day[participant]["roster"]["F"][key_forward]["SOG"]

            tot_forward_pool_pts = tot_goal * pool["settings"]["forward_pts_goals"] + \
                                        tot_assist * pool["settings"]["forward_pts_assists"] + \
                                        tot_hat_trick * pool["settings"]["forward_pts_hattricks"] + \
                                        tot_shootout_goals * pool["settings"]["defender_pts_shootout_goals"]

            score_by_day[participant]["F_tot"] = {
                                                    "G": tot_goal, 
                                                    "A": tot_assist, 
                                                    "HT": tot_hat_trick, 
                                                    "SOG": tot_shootout_goals,  
                                                    "pts": tot_forward_pool_pts
                                                    }

            dict_cumulate[participant]["G_F"] = last_day_cumulate["G_F"] + tot_goal
            dict_cumulate[participant]["A_F"] = last_day_cumulate["A_F"] + tot_assist
            dict_cumulate[participant]["HT_F"] = last_day_cumulate["HT_F"] + tot_hat_trick
            dict_cumulate[participant]["SOG_F"] = last_day_cumulate["SOG_F"] + tot_shootout_goals
            dict_cumulate[participant]["P_F"] = last_day_cumulate["P_F"] + tot_forward_pool_pts

            # Defenders

            tot_goal = 0
            tot_assist = 0
            tot_hat_trick = 0
            tot_shootout_goals = 0

            for key_defender in score_by_day[participant]["roster"]["D"]:
                score_by_day[participant]["roster"]["D"][key_defender] = get_skaters_stats(int(key_defender), today_pointers, played["players"])
                if score_by_day[participant]["roster"]["D"][key_defender] is not None:
                    tot_goal += score_by_day[participant]["roster"]["D"][key_defender]["G"]
                    tot_assist += score_by_day[participant]["roster"]["D"][key_defender]["A"]
                    if score_by_day[participant]["roster"]["D"][key_defender]["G"] >= 3:
                        tot_hat_trick += 1
                    if "SOG" in score_by_day[participant]["roster"]["D"][key_defender]:
                        tot_shootout_goals += score_by_day[participant]["roster"]["D"][key_defender]["SOG"]

            tot_defender_pool_pts = tot_goal * pool["settings"]["defender_pts_goals"] + \
                                        tot_assist * pool["settings"]["defender_pts_assists"] + \
                                        tot_hat_trick * pool["settings"]["defender_pts_hattricks"] + \
                                        tot_shootout_goals * pool["settings"]["defender_pts_shootout_goals"]

            score_by_day[participant]["D_tot"] = {
                                                    "G": tot_goal,
                                                    "A": tot_assist,
                                                    "HT": tot_hat_trick,
                                                    "SOG": tot_shootout_goals,
                                                    "pts": tot_defender_pool_pts
                                                    }

            dict_cumulate[participant]["G_D"] = last_day_cumulate["G_D"] + tot_goal
            dict_cumulate[participant]["A_D"] = last_day_cumulate["A_D"] + tot_assist
            dict_cumulate[participant]["HT_D"] = last_day_cumulate["HT_D"] + tot_hat_trick
            dict_cumulate[participant]["SOG_D"] = last_day_cumulate["SOG_D"] + tot_shootout_goals
            dict_cumulate[participant]["P_D"] = last_day_cumulate["P_D"] + tot_defender_pool_pts

            # Goalies

            tot_goal = 0
            tot_assist = 0
            tot_Win = 0
            tot_SO = 0
            tot_OT = 0

            for key_goaly in score_by_day[participant]["roster"]["G"]:
                score_by_day[participant]["roster"]["G"][key_goaly] = get_goalies_stats(int(key_goaly), today_pointers)
                if score_by_day[participant]["roster"]["G"][key_goaly] is not None:
                    tot_goal += score_by_day[participant]["roster"]["G"][key_goaly]["G"]
                    tot_assist += score_by_day[participant]["roster"]["G"][key_goaly]["A"]
                    if score_by_day[participant]["roster"]["G"][key_goaly]["W"]:
                        tot_Win += 1
                    if score_by_day[participant]["roster"]["G"][key_goaly]["SO"]:                    
                        tot_SO += 1
                    if score_by_day[participant]["roster"]["G"][key_goaly]["OT"]:                    
                        tot_OT += 1

            tot_goaly_pool_pts = tot_goal * pool["settings"]["goalies_pts_goals"] + tot_assist * pool["settings"]["goalies_pts_assists"] + tot_Win * pool["settings"]["goalies_pts_wins"] + tot_SO * pool["settings"]["goalies_pts_shutouts"] + tot_OT * pool["settings"]["goalies_pts_overtimes"] 
            score_by_day[participant]["G_tot"] = {"G": tot_goal, "A": tot_assist, "W": tot_Win, "SO": tot_SO, "OT": tot_OT, "pts": tot_goaly_pool_pts}
            score_by_day[participant]["tot_pts"] = tot_forward_pool_pts + tot_defender_pool_pts + tot_goaly_pool_pts

            dict_cumulate[participant]["G_G"] = last_day_cumulate["G_G"] + tot_goal
            dict_cumulate[participant]["A_G"] = last_day_cumulate["A_G"] + tot_assist
            dict_cumulate[participant]["W_G"] = last_day_cumulate["W_G"] + tot_Win
            dict_cumulate[participant]["SO_G"] = last_day_cumulate["SO_G"] + tot_SO 
            dict_cumulate[participant]["OT_G"] = last_day_cumulate["OT_G"] + tot_OT
            dict_cumulate[participant]["P_G"] = last_day_cumulate["P_G"] + tot_goaly_pool_pts


            dict_cumulate[participant]["P"] = last_day_cumulate["P"] + score_by_day[participant]["tot_pts"]

            score_by_day[participant]["cumulate"] = dict_cumulate[participant]

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.score_by_day.{str(day)}": score_by_day}}, upsert=True)
        # print(score_by_day)

cumulate_daily_roster_pts.last_today_pointers = {}
cumulate_daily_roster_pts.last_played = {}

def lock_daily_roster(day = None):
    if day is None:
        day = date.today()
        if datetime.now().hour < 12:    # Before 12h AM, fetch the data from yesterday in the case a game was completed after 12h PM.
            day -= timedelta(days=1)

    daily_roster = {}

    for pool in db.pools.find({"status": "InProgress"}):
        for participant in pool["participants"]:
            print(participant)
            daily_roster[participant] = {}

            daily_roster[participant]["roster"] = {}

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
    start_date = date(2023, 2, 11)     # beginning of the 2021-2022 season
    end_date = date.today()
    delta = timedelta(days=1)
    while start_date <= end_date:
        print(start_date)
        lock_daily_roster(start_date)
        cumulate_daily_roster_pts(start_date)
        start_date += delta

    # lock_daily_roster()
    # cumulate_daily_roster_pts()