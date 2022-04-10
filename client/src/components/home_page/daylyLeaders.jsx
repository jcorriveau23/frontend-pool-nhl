import React from 'react';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PropTypes from 'prop-types';

// images
import { logos } from '../img/logos';

export default function DayLeaders({ dayLeaders, formatDate }) {
  return (
    <Tabs>
      <TabList>
        <Tab>Skaters</Tab>
        <Tab>Goalies</Tab>
      </TabList>
      <TabPanel>
        <table className="content-table">
          <thead>
            <tr>
              <th colSpan={5}>Dayly Leaders</th>
            </tr>
            <tr>
              <th colSpan={5}>{formatDate}</th>
            </tr>
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
                  .sort((a, b) => b.stats.goals + b.stats.assists - (a.stats.goals + a.stats.assists))
                  .map(skater => (
                    <tr key={skater.id}>
                      <td>
                        <img src={logos[skater.team]} alt="" width="40" height="40" />
                      </td>
                      <td>
                        <Link to={`/player-info/${skater.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                          {skater.name}
                        </Link>
                      </td>
                      <td>{skater.stats.goals}</td>
                      <td>{skater.stats.assists}</td>
                      <td>{skater.stats.goals + skater.stats.assists}</td>
                    </tr>
                  ))}
              </>
            ) : (
              <tr>
                <th colSpan={5}>No games started yet on the {formatDate}.</th>
              </tr>
            )}
          </tbody>
        </table>
      </TabPanel>
      <TabPanel>
        <table className="content-table">
          <thead>
            <tr>
              <th colSpan={5}>Dayly Leaders</th>
            </tr>
            <tr>
              <th colSpan={5}>{formatDate}</th>
            </tr>
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
                    <tr>
                      <td>
                        <img src={logos[goalie.team]} alt="" width="40" height="40" />
                      </td>
                      <td>
                        <Link to={`/player-info/${goalie.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                          {goalie.name}
                        </Link>
                      </td>
                      <td>{goalie.stats.shots}</td>
                      <td>{goalie.stats.saves}</td>
                      <td>{Math.round((goalie.stats.savePercentage + Number.EPSILON) * 100) / 100}</td>
                    </tr>
                  ))}
              </>
            ) : (
              <tr>
                <th colSpan={5}>No games started yet on the {formatDate}.</th>
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
