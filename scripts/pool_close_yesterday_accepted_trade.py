# this script will go through each pool in the database and look if there is some trade with status == "ACCEPTED" from yesterday.
# if yes, add the items of each traded to the corresponding poolers. (players in reservist + picks in tradable_picks)
# change the trade status to COMPLETED
# finally save the pool in the database
# this script should run every morning (lets say 5am)

from pymongo import MongoClient
from datetime import date, datetime, timedelta

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.pooljdope

yesterday = date.today()# - timedelta(days=1) # TODO change to look only on yesterday 



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

            for player in trade["fromItems"]["players"]:
                pool["context"][askTo]["chosen_reservist"].append(player)

            for pick in trade["fromItems"]["picks"]:
                pool["context"][askTo]["tradable_picks"].append(pick)

            # the toItems are being transfered to the proposedBy pooler

            for player in trade["toItems"]["players"]:
                pool["context"][proposedBy]["chosen_reservist"].append(player)

            for pick in trade["toItems"]["picks"]:
                pool["context"][proposedBy]["tradable_picks"].append(pick)

            # before updating the document in the database set state of the trade to complete.
            trade["status"] = "COMPLETED"
            print("updated one trade")

    # only update when an ACCEPTED trade has been processed

    if isPoolUpdated:
        db.pools.update_one({'_id': pool["_id"]}, {'$set': pool}, upsert=True) # upsert = True, to create a new document if not found