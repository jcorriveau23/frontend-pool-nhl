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

  useEffect(() => {
    if (formatDate !== prevFormatDate && formatDate) {
      // get the day leaders data from database.

      axios
        .get(`/api-rust/daily_leaders/${formatDate}`)
        .then(res => {
          if (res.status === 200) {
            setDayLeaders(res.data);
            setPrevFormatDate(formatDate);
          }
        })
        .catch(e => {
          setDayLeaders(null);
          setPrevFormatDate('');
          console.log(e.response);
        });
    }
  }, [formatDate]);

  const render_owner = playerId =>
    playersIdToPoolerMap && playersIdToPoolerMap[playerId] ? (
      <User id={playersIdToPoolerMap[playerId]} user={user} DictUsers={DictUsers} />
    ) : (
      <td />
    );

  const get_context_column_span = () => (isPoolContext ? 6 : 5);

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
                  <th>Team</th>
                  <th>Name</th>
                  {isPoolContext ? <th>Owner</th> : null}
                  <th>G</th>
                  <th>A</th>
                  <th>PTS</th>
                </tr>
                {dayLeaders.skaters
                  .filter((p, i) => (showAllPlayers ? true : i < 15))
                  .sort((a, b) => 1.01 * b.stats.goals + b.stats.assists - (1.01 * a.stats.goals + a.stats.assists))
                  .map(skater => (
                    <tr key={skater.id}>
                      <td>
                        <img src={logos[skater.team]} alt="" width="40" height="40" />
                      </td>
                      <td>
                        <PlayerLink name={skater.name} id={skater.id} injury={injury} />
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
                  <th>Team</th>
                  <th>Name</th>
                  {isPoolContext ? <th>Owner</th> : null}
                  <th>Shot</th>
                  <th>Saves</th>
                  <th>Save (%)</th>
                </tr>
                {dayLeaders.goalies
                  .sort((a, b) => b.stats.savePercentage - a.stats.savePercentage)
                  .map(goalie => (
                    <tr key={goalie.id}>
                      <td>
                        <img src={logos[goalie.team]} alt="" width="40" height="40" />
                      </td>
                      <td>
                        <PlayerLink name={goalie.name} id={goalie.id} injury={injury} />
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
