import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// logo
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

// components
import PlayerLink from '../playerLink';
import User from '../user';
import NaviguateToday from '../pool_state/naviguateToday';

// images
import { logos } from '../img/logos';

export default function DayLeaders({
  formatDate,
  todayFormatDate,
  playersIdToPoolerMap,
  user,
  DictUsers,
  injury,
  isPoolContext, // Owner column added in pool Context to gives the information of the pooler who owns the player
}) {
  const [prevFormatDate, setPrevFormatDate] = useState('');
  const [dayLeaders, setDayLeaders] = useState(null);
  const [showAllPlayers, setShowAllPlayers] = useState(false); // by default only show the 15 leaders

  const get_daily_leaders = async () => {
    try {
      const res = await axios.get(`/api-rust/daily_leaders/${formatDate}`);
      setDayLeaders(res.data);
      setPrevFormatDate(formatDate);
    } catch (e) {
      setDayLeaders(null);
      setPrevFormatDate('');
      console.log(e.response.data);
    }
  };

  useEffect(() => {
    if (formatDate !== prevFormatDate && formatDate) {
      // get the day leaders data from database.
      get_daily_leaders();
    }
  }, [formatDate]);

  const render_owner = playerId =>
    playersIdToPoolerMap && playersIdToPoolerMap[playerId] ? (
      <td>
        <User id={playersIdToPoolerMap[playerId]} user={user} DictUsers={DictUsers} />
      </td>
    ) : (
      <td />
    );

  const get_context_column_span = () => (isPoolContext ? 7 : 6);

  const render_more_button = () => (
    <tr>
      <td colSpan={get_context_column_span()}>
        <button className="base-button" type="button" onClick={() => setShowAllPlayers(!showAllPlayers)}>
          {showAllPlayers ? (
            <>
              Show Less...
              <MdExpandLess size={30} style={{ float: 'right' }} />
            </>
          ) : (
            <>
              Show All...
              <MdExpandMore size={30} style={{ float: 'right' }} />
            </>
          )}
        </button>
      </td>
    </tr>
  );

  return (
    <Tabs>
      <TabList>
        <Tab>Skaters</Tab>
        <Tab>Goalies</Tab>
      </TabList>
      <TabPanel>
        <table className="content-table-no-min">
          <thead>
            <NaviguateToday
              formatDate={formatDate}
              todayFormatDate={todayFormatDate}
              msg="Daily Leaders"
              colSpan={get_context_column_span()}
            />
          </thead>
          <tbody>
            {dayLeaders ? (
              <>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Team</th>
                  {isPoolContext ? <th>Owner</th> : null}
                  <th>G</th>
                  <th>A</th>
                  <th>PTS</th>
                </tr>
                {dayLeaders.skaters
                  .sort((a, b) => 1.01 * b.stats.goals + b.stats.assists - (1.01 * a.stats.goals + a.stats.assists))
                  .filter((p, i) => (showAllPlayers ? true : i < 15))
                  .map((skater, i) => (
                    <tr key={skater.id}>
                      <td>{i + 1}</td>
                      <td>
                        <PlayerLink name={skater.name} id={skater.id} injury={injury} />
                      </td>
                      <td>
                        <img src={logos[skater.team]} alt="" width="40" height="40" />
                      </td>
                      {isPoolContext ? render_owner(skater.id) : null}
                      <td>{skater.stats.goals}</td>
                      <td>{skater.stats.assists}</td>
                      <td>
                        <b style={{ color: '#a20' }}>{skater.stats.goals + skater.stats.assists}</b>
                      </td>
                    </tr>
                  ))}
                {render_more_button()}
              </>
            ) : (
              <tr>
                <td colSpan={get_context_column_span()}>No games started yet ({formatDate})</td>
              </tr>
            )}
          </tbody>
        </table>
      </TabPanel>
      <TabPanel>
        <table className="content-table-no-min">
          <thead>
            <NaviguateToday
              formatDate={formatDate}
              todayFormatDate={todayFormatDate}
              msg="Daily Leaders"
              colSpan={get_context_column_span()}
            />
          </thead>
          <tbody>
            {dayLeaders ? (
              <>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Team</th>
                  {isPoolContext ? <th>Owner</th> : null}
                  <th>Shot</th>
                  <th>Saves</th>
                  <th>Save (%)</th>
                </tr>
                {dayLeaders.goalies
                  .sort((a, b) => b.stats.savePercentage - a.stats.savePercentage)
                  .map((goalie, i) => (
                    <tr key={goalie.id}>
                      <td>{i + 1}</td>
                      <td>
                        <PlayerLink name={goalie.name} id={goalie.id} injury={injury} />
                      </td>
                      <td>
                        <img src={logos[goalie.team]} alt="" width="40" height="40" />
                      </td>
                      {isPoolContext ? render_owner(goalie.id) : null}
                      <td>{goalie.stats.shots}</td>
                      <td>{goalie.stats.saves}</td>
                      <td>{Math.round((goalie.stats.savePercentage + Number.EPSILON) * 100) / 100}</td>
                    </tr>
                  ))}
                {render_more_button()}
              </>
            ) : (
              <tr>
                <td colSpan={get_context_column_span()}>No games started yet ({formatDate})</td>
              </tr>
            )}
          </tbody>
        </table>
      </TabPanel>
    </Tabs>
  );
}
