from pymongo import MongoClient

mo_c = MongoClient()
db = mo_c.hockeypool

for pool in db.pools.find():
    print(pool["name"])
    pool["settings"]["number_worst_forwards_to_ignore"] = 0
    pool["settings"]["number_worst_defenders_to_ignore"] = 0
    pool["settings"]["number_worst_goalies_to_ignore"] = 0

    db.pools.update_one({"name": pool["name"]}, {"$set": {"settings": pool["settings"]}}, upsert=True)
