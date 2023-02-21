from pymongo import MongoClient

mo_c = MongoClient()
db = mo_c.hockeypool

for pool in db.pools.find({"status": "InProgress"}):
    
    players = {}

    for participant in pool["participants"]:
        print(participant)

        # Forwards

        player_id = []
        for forward in pool["context"]["pooler_roster"][participant]["chosen_forwards"]:
            player_id.append(forward["id"])
            players[str(forward["id"])] = forward

        pool["context"]["pooler_roster"][participant]["chosen_forwards"] = player_id

        # Defenders

        player_id = []
        for defender in pool["context"]["pooler_roster"][participant]["chosen_defenders"]:
            player_id.append(defender["id"])
            players[str(defender["id"])] = defender

        pool["context"]["pooler_roster"][participant]["chosen_defenders"] = player_id

        # Goalies

        player_id = []
        for goalies in pool["context"]["pooler_roster"][participant]["chosen_goalies"]:
            player_id.append(goalies["id"])
            players[str(goalies["id"])] = goalies

        pool["context"]["pooler_roster"][participant]["chosen_goalies"] = player_id

        # Reservists

        player_id = []
        for reservist in pool["context"]["pooler_roster"][participant]["chosen_reservists"]:
            player_id.append(reservist["id"])
            players[str(reservist["id"])] = reservist

        pool["context"]["pooler_roster"][participant]["chosen_reservists"] = player_id

    pool["context"]["players"] = players

db.pools.update_one({"name": pool["name"]}, {"$set": {"context": pool["context"]}}, upsert=True)
