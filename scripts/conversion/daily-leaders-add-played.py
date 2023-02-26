from pymongo import MongoClient
from datetime import date, timedelta

mo_c = MongoClient()
db = mo_c.hockeypool

start_date = date(2022, 1, 1)
end_date = date.today()
delta = timedelta(days=1)

while start_date <= end_date:
    print(start_date)
    start_date += delta
    day_leaders = db.day_leaders.find_one({"date": str(start_date)})
    played = db.played.find_one({"date": str(start_date)})

    print(type(day_leaders))

    if day_leaders is not None and played is not None:
        day_leaders["played"] = played["players"]
        db.day_leaders.update_one({"date": str(start_date)}, {'$set': day_leaders}, upsert=True)

