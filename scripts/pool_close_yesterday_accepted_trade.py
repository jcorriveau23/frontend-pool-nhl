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

def close_accepted_trade():
    for pool in db.pools.find():
        isPoolUpdated = False

        print(pool["name"])
        if pool["trades"] is not None:
            for trade in pool["trades"]:
                if trade["status"] == "ACCEPTED": 
                    #print(trade)
                    isPoolUpdated = True

                    proposed_by = trade["proposed_by"]
                    ask_to = trade["ask_to"]

                    from_items = trade["from_items"]
                    to_items = trade["to_items"]

                    # the from_items are being transfered to the ask_to pooler

                    for player in trade["from_items"]["players"]:
                        pool["context"]["pooler_roster"][ask_to]["chosen_reservists"].append(player)

                    for pick in trade["from_items"]["picks"]:
                        pool["context"]["pooler_roster"][ask_to]["tradable_picks"].append(pick)

                    # the to_items are being transfered to the proposed_by pooler

                    for player in trade["to_items"]["players"]:
                        pool["context"]["pooler_roster"][proposed_by]["chosen_reservists"].append(player)

                    for pick in trade["to_items"]["picks"]:
                        pool["context"]["pooler_roster"][proposed_by]["tradable_picks"].append(pick)

                    # before updating the document in the database set state of the trade to complete.
                    trade["status"] = "COMPLETED"
                    print("updated one trade")

        # only update when an ACCEPTED trade has been processed

        if isPoolUpdated:
            db.pools.update_one({'_id': pool["_id"]}, {'$set': pool}, upsert=True) # upsert = True, to create a new document if not found

if __name__ == "__main__":
    close_accepted_trade()
        