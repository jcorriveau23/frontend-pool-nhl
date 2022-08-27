# Schedule Library imported
import json
import time
from datetime import date, datetime, timedelta

import requests
import schedule
from pymongo import MongoClient

from pool_cumulate_yesterday_roster_points import lock_daily_roster, cumulate_daily_roster_pts
from day_points_leaders import fetch_pointers_day
from fetch_injury import fetch_injured_players
from update_pool_players_team import update_pool_players_team

# create an client instance of the MongoDB class

mo_c = MongoClient()
db = mo_c.pooljdope
SEASON = '20212022'
API_URL = 'https://statsapi.web.nhl.com'
 
# Task scheduling
# After every 3mins get_live_day_points_leaders() is called.
schedule.every(3).minutes.do(fetch_pointers_day)
schedule.every(3).minutes.do(cumulate_daily_roster_pts)
 
# Every day at 05:00 time close_accepted_trade() is called.
schedule.every().day.at("12:00").do(lock_daily_roster)
schedule.every().day.at("05:00").do(fetch_injured_players)
schedule.every().day.at("05:00").do(update_pool_players_team)

print("start the scheduling!")
while True:
    # Checks whether a scheduled task
    # is pending to run or not
    schedule.run_pending()
    time.sleep(1)
