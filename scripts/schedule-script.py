# Schedule Library imported
import time
import schedule

from pool_cumulate_live_data import lock_daily_roster, cumulate_daily_roster_pts
from day_points_leaders import fetch_pointers_day
from fetch_injury_cbs import fetch_injured_players_cbs
from update_pool_players_team import update_pool_players_team

# Task scheduling
# After every 3mins get_live_day_points_leaders() is called.
schedule.every(3).minutes.do(fetch_pointers_day)
schedule.every(1).hours.do(fetch_injured_players_cbs)
 
schedule.every().day.at("12:00").do(lock_daily_roster)
schedule.every().day.at("05:00").do(cumulate_daily_roster_pts)
schedule.every().day.at("11:55").do(cumulate_daily_roster_pts)
#schedule.every().day.at("05:00").do(update_pool_players_team)

print("start the scheduling!")
while True:
    # Checks whether a scheduled task
    # is pending to run or not
    schedule.run_pending()
    time.sleep(1)
