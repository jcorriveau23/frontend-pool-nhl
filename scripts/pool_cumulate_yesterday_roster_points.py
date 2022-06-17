# this script will go through each pool in the database and cumulate the points of the players if it is not in the reservist. 

from pymongo import MongoClient
from datetime import date, datetime, timedelta

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.pooljdope

def get_skaters_stats(id, today_pointers):
    for skater in today_pointers["skaters"]:
        if skater["id"] == id:
            return {
                "G": skater["stats"]["goals"],
                "A": skater["stats"]["assists"]
                }

def get_goalies_stats(id, today_pointers):
    for goaly in today_pointers["goalies"]:
        if goaly["id"] == id:
            return {
                    "G": goaly["stats"]["goals"], 
                    "A": goaly["stats"]["assists"], 
                    "W": "decision" in goaly["stats"] and goaly["stats"]["decision"] == "W", 
                    "SO": goaly["stats"]["shots"] == goaly["stats"]["saves"]  
                    }

def init_cumulate_dict():
    return {
        # Forwards
        "A_F": 0,
        "HT_F": 0,
        "G_F": 0,
        "P_F": 0,
        # Defenders
        "G_D": 0,
        "A_D": 0,
        "HT_D": 0,
        "P_D": 0,
        # Goalies
        "G_G": 0,
        "A_G": 0,
        "W_G": 0,
        "SO_G": 0,
        "P_G": 0,
        # Total pts cumulate
        "P": 0
    }


    dict_cumulate[participant]["P"] = 0

def cumulate_daily_roster_pts(day = None):
    dict_cumulate = {}

    if day is None:
        day = date.today()
        if datetime.now().hour < 12:
            day -= timedelta(days=1)

    today_pointers = db.day_leaders.find_one({"date": str(day)})
    if today_pointers is None: # TODO add a verification of the date so this function is only called on the today date.
       print("skip this day.")
       return

    for pool in db.pools.find():
        if pool["context"] is None or pool["context"]["score_by_day"] is None:
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
                dict_cumulate[participant] = {}

                dict_cumulate[participant] = init_cumulate_dict()

            # Forward

            tot_goal = 0
            tot_assist = 0
            tot_hat_trick = 0

            for key_forward in score_by_day[participant]["roster"]["F"]:
                score_by_day[participant]["roster"]["F"][key_forward] = get_skaters_stats(int(key_forward), today_pointers)
                if score_by_day[participant]["roster"]["F"][key_forward] is not None:
                    tot_goal += score_by_day[participant]["roster"]["F"][key_forward]["G"]
                    tot_assist += score_by_day[participant]["roster"]["F"][key_forward]["A"]
                    if score_by_day[participant]["roster"]["F"][key_forward]["G"] >= 3:
                        tot_hat_trick += 1

            tot_forward_pool_pts = tot_goal * pool["forward_pts_goals"] + tot_assist * pool["forward_pts_assists"] + tot_hat_trick * pool["forward_pts_hattricks"]
            score_by_day[participant]["F_tot"] = {"G": tot_goal, "A": tot_assist, "HT": tot_hat_trick, "pts": tot_forward_pool_pts}

            dict_cumulate[participant]["G_F"] = last_day_cumulate["G_F"] + tot_goal
            dict_cumulate[participant]["A_F"] = last_day_cumulate["A_F"] + tot_assist
            dict_cumulate[participant]["HT_F"] = last_day_cumulate["HT_F"] + tot_hat_trick
            dict_cumulate[participant]["P_F"] = last_day_cumulate["P_F"] + tot_forward_pool_pts

            # Defenders

            tot_goal = 0
            tot_assist = 0
            tot_hat_trick = 0

            for key_defender in score_by_day[participant]["roster"]["D"]:
                score_by_day[participant]["roster"]["D"][key_defender] = get_skaters_stats(int(key_defender), today_pointers)
                if score_by_day[participant]["roster"]["D"][key_defender] is not None:
                    tot_goal += score_by_day[participant]["roster"]["D"][key_defender]["G"]
                    tot_assist += score_by_day[participant]["roster"]["D"][key_defender]["A"]
                    if score_by_day[participant]["roster"]["D"][key_defender]["G"] >= 3:
                        tot_hat_trick += 1

            tot_defender_pool_pts = tot_goal * pool["defender_pts_goals"] + tot_assist * pool["defender_pts_assists"] + tot_hat_trick * pool["defender_pts_hattricks"]
            score_by_day[participant]["D_tot"] = {"G": tot_goal, "A": tot_assist, "HT": tot_hat_trick, "pts": tot_defender_pool_pts}

            dict_cumulate[participant]["G_D"] = last_day_cumulate["G_D"] + tot_goal
            dict_cumulate[participant]["A_D"] = last_day_cumulate["A_D"] + tot_assist
            dict_cumulate[participant]["HT_D"] = last_day_cumulate["HT_D"] + tot_hat_trick
            dict_cumulate[participant]["P_D"] = last_day_cumulate["P_D"] + tot_defender_pool_pts

            # Goalies

            tot_goal = 0
            tot_assist = 0
            tot_Win = 0
            tot_SO = 0

            for key_goaly in score_by_day[participant]["roster"]["G"]:
                score_by_day[participant]["roster"]["G"][key_goaly] = get_goalies_stats(int(key_goaly), today_pointers)
                if score_by_day[participant]["roster"]["G"][key_goaly] is not None:
                    tot_goal += score_by_day[participant]["roster"]["G"][key_goaly]["G"]
                    tot_assist += score_by_day[participant]["roster"]["G"][key_goaly]["A"]
                    if score_by_day[participant]["roster"]["G"][key_goaly]["W"]:
                        tot_Win += 1
                    if score_by_day[participant]["roster"]["G"][key_goaly]["SO"]:                    
                        tot_SO += 1

            tot_goaly_pool_pts = tot_goal * pool["goalies_pts_goals"] + tot_assist * pool["goalies_pts_assists"] + tot_Win * pool["goalies_pts_wins"] + tot_SO * pool["goalies_pts_shutouts"] 
            score_by_day[participant]["G_tot"] = {"G": tot_goal, "A": tot_assist, "W": tot_Win, "SO": tot_SO, "pts": tot_goaly_pool_pts}
            score_by_day[participant]["tot_pts"] = tot_forward_pool_pts + tot_defender_pool_pts + tot_goaly_pool_pts

            dict_cumulate[participant]["G_G"] = last_day_cumulate["G_G"] + tot_goal
            dict_cumulate[participant]["A_G"] = last_day_cumulate["A_G"] + tot_assist
            dict_cumulate[participant]["W_G"] = last_day_cumulate["W_G"] + tot_Win
            dict_cumulate[participant]["SO_G"] = last_day_cumulate["SO_G"] + tot_SO
            dict_cumulate[participant]["P_G"] = last_day_cumulate["P_G"] + tot_goaly_pool_pts


            dict_cumulate[participant]["P"] = last_day_cumulate["P"] + score_by_day[participant]["tot_pts"]

            score_by_day[participant]["cumulate"] = dict_cumulate[participant]

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.score_by_day.{str(day)}": score_by_day}}, upsert=True)
        #print(score_by_day)

def lock_daily_roster(day = None):
    #if today_pointers is None: # TODO add a verification of the date so this function is only called on the today date.
    #    print("skip this day.")
    #    return

    if day is None:
        day = date.today()

    daily_roster = {}

    for pool in db.pools.find():
        if pool["participants"] is None:
            continue

        for participant in pool["participants"]:
            print(participant)
            daily_roster[participant] = {}

            daily_roster[participant]["roster"] = {}

            # Forwards

            daily_roster[participant]["roster"]["F"] = {}

            for forward in pool["context"]["pooler_roster"][participant]["chosen_forwards"]:
                daily_roster[participant]["roster"]["F"][str(forward["id"])] = None

            # Defenders

            daily_roster[participant]["roster"]["D"] = {}

            for defender in pool["context"]["pooler_roster"][participant]["chosen_defenders"]:
                daily_roster[participant]["roster"]["D"][str(defender["id"])] = None

            # Goalies

            daily_roster[participant]["roster"]["G"] = {}

            for goaly in pool["context"]["pooler_roster"][participant]["chosen_goalies"]:
                daily_roster[participant]["roster"]["G"][str(goaly["id"])] = None

        db.pools.update_one({"name": pool["name"]}, {"$set": {f"context.score_by_day.{str(day)}": daily_roster}}, upsert=True)


if __name__ == "__main__":
    #start_date = date(2022, 5, 22)  # beginning of the 2021-2022 season
    start_date = date(2022, 5, 2)  # beginning of the 2021-2022 playoff
    #start_date = date.today()
    end_date = date.today()
    delta = timedelta(days=1)
    while start_date <= end_date:
        print(start_date)
        lock_daily_roster(start_date)
        cumulate_daily_roster_pts(start_date)
        start_date += delta
        