import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PropTypes from 'prop-types';

// components
import PlayerLink from '../playerLink';
import User from '../user';
import NaviguateToday from '../pool_state/naviguateToday';

// images
import { logos } from '../img/logos';

export default function DayLeaders({ formatDate, playersIdToPoolerMap, setDate, gameStatus, user, DictUsers, injury }) {
  const [prevFormatDate, setPrevFormatDate] = useState('');
  const [dayLeaders, setDayLeaders] = useState(null);

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
              setDate={setDate}
              gameStatus={gameStatus}
              msg="Daily Leaders"
              colSpan={5}
            />
          </thead>
          <tbody>
            {dayLeaders ? (
              <>
                <tr>
                  <th>Team</th>
                  <th>Name</th>
                  <th>G</th>
                  <th>A</th>
                  <th>PTS</th>
                </tr>
                {dayLeaders.skaters
                  .sort((a, b) => 1.01 * b.stats.goals + b.stats.assists - (1.01 * a.stats.goals + a.stats.assists))
                  .map(skater => (
                    <tr key={skater.id}>
                      <td>
                        <img src={logos[skater.team]} alt="" width="40" height="40" />
                      </td>
                      <td>
                        <PlayerLink name={skater.name} id={skater.id} injury={injury} />
                        {playersIdToPoolerMap && playersIdToPoolerMap[skater.id] ? (
                          <User
                            id={playersIdToPoolerMap[skater.id]}
                            user={user}
                            DictUsers={DictUsers}
                            parenthesis={true}
                          />
                        ) : null}
                      </td>
                      <td>{skater.stats.goals}</td>
                      <td>{skater.stats.assists}</td>
                      <td>{skater.stats.goals + skater.stats.assists}</td>
                    </tr>
                  ))}
              </>
            ) : (
              <tr>
                <td colSpan={5}>No games started yet ({formatDate})</td>
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
              setDate={setDate}
              gameStatus={gameStatus}
              msg="Daily Leaders"
              colSpan={5}
            />
          </thead>
          <tbody>
            {dayLeaders ? (
              <>
                <tr>
                  <th>Team</th>
                  <th>Name</th>
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
                        {playersIdToPoolerMap && playersIdToPoolerMap[goalie.id] ? (
                          <User
                            id={playersIdToPoolerMap[goalie.id]}
                            user={user}
                            DictUsers={DictUsers}
                            parenthesis={true}
                          />
                        ) : null}
                      </td>
                      <td>{goalie.stats.shots}</td>
                      <td>{goalie.stats.saves}</td>
                      <td>{Math.round((goalie.stats.savePercentage + Number.EPSILON) * 100) / 100}</td>
                    </tr>
                  ))}
              </>
            ) : (
              <tr>
                <td colSpan={5}>No games started yet ({formatDate})</td>
              </tr>
            )}
          </tbody>
        </table>
      </TabPanel>
    </Tabs>
  );
}

DayLeaders.propTypes = {
  dayLeaders: PropTypes.shape({
    skaters: PropTypes.arrayOf(PropTypes.shape({})),
    goalies: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  formatDate: PropTypes.string.isRequired,
};

DayLeaders.defaultProps = {
  dayLeaders: null,
};
