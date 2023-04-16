from pymongo import MongoClient

mo_c = MongoClient()
db = mo_c.hockeypool

for pool in db.pools.find():
    
    pool["settings"] = {}

    pool["settings"]["number_forwards"] = pool["number_forwards"]
    pool["settings"]["number_defenders"] = pool["number_defenders"]
    pool["settings"]["number_goalies"] = pool["number_goalies"]
    pool["settings"]["number_reservists"] = pool["number_reservists"]
    pool["settings"]["roster_modification_date"] = pool["roster_modification_date"]
    pool["settings"]["forward_pts_goals"] = pool["forward_pts_goals"]
    pool["settings"]["forward_pts_assists"] = pool["forward_pts_assists"]
    pool["settings"]["forward_pts_hattricks"] = pool["forward_pts_hattricks"]
    pool["settings"]["forward_pts_shootout_goals"] = pool["forward_pts_shootout_goals"]
    pool["settings"]["defender_pts_goals"] = pool["defender_pts_goals"]
    pool["settings"]["defender_pts_assists"] = pool["defender_pts_assists"]
    pool["settings"]["defender_pts_hattricks"] = pool["defender_pts_hattricks"]
    pool["settings"]["defender_pts_shootout_goals"] = pool["defender_pts_shootout_goals"]
    pool["settings"]["goalies_pts_wins"] = pool["goalies_pts_wins"]
    pool["settings"]["goalies_pts_shutouts"] = pool["goalies_pts_shutouts"]
    pool["settings"]["goalies_pts_goals"] = pool["goalies_pts_goals"]
    pool["settings"]["goalies_pts_assists"] = pool["goalies_pts_assists"]
    pool["settings"]["goalies_pts_overtimes"] = pool["goalies_pts_overtimes"]
    pool["settings"]["can_trade"] = True
    pool["settings"]["assistants"] = pool["assistants"]

    # Dynastie settings
    pool["settings"]["dynastie_settings"] = {}
    pool["settings"]["dynastie_settings"]["next_season_number_players_protected"] = pool["next_season_number_players_protected"]
    pool["settings"]["dynastie_settings"]["tradable_picks"] = pool["tradable_picks"]


    db.pools.update_one({"name": pool["name"]}, {"$set": pool}, upsert=True)
