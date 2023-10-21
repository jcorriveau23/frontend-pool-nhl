from pymongo import MongoClient

mo_c = MongoClient()
db = mo_c.hockeypool

for pool in db.pools.find():
    print(pool["name"])
    
    for date, day_score in pool["context"]["score_by_day"].items():
        for participant, day_score_participant in day_score.items():
            day_score_participant["is_cumulated"] = True



    db.pools.update_one({"name": pool["name"]}, {"$set": {"context": pool["context"]}}, upsert=True)
