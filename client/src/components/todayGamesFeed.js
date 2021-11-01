



// https://statsapi.web.nhl.com/api/v1/schedule?startDate=2021-10-31&endDate=2021-10-31     to get all date of 2021-10-31 (date of today)

// json["dates"]["games"][0..x]["link"]  to get the link that tells us the stats of the specific game (/api/v1/game/2021020128/feed/live)

// https://statsapi.web.nhl.com/api/v1/game/2021020128/feed/live

json["boxscore"]["home"]["teamStats"]   // for general game stats
json["boxscore"]["away"]["teamStats"] 
