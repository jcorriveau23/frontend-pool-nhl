// https://statsapi.web.nhl.com/api/v1/standings: this call gives all the information we need to make a ranking team board by division conference or league.

import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { team_info } from '../img/logos';

// css
import './teamStanding.css';
import '../react-tabs.css';

export default function TeamsStanding({ season }) {
  const [easternTeams, setEasternTeams] = useState(null);
  const [westernTeams, setWesternTeams] = useState(null);
  const [leagueTeams, setLeagueTeams] = useState(null);
  const [wildCardAvailable, setWildCardAvailable] = useState(true);
  const [standing, setStanding] = useState(null);

  const get_standing = async () => {
    const teams = [];
    const easternTeamsTmp = [];
    const westernTeamsTmp = [];

    try {
      const res = await axios.get(`https://statsapi.web.nhl.com/api/v1/standings?season=${season}`);

      // 1993-1994 is the year where wild card ranking started.
      setWildCardAvailable(!(Number(season) < 19931994));

      for (let i = 0; i < res.data.records.length; i += 1) {
        for (let j = 0; j < res.data.records[i].teamRecords.length; j += 1) {
          teams.push(res.data.records[i].teamRecords[j]);

          if (res.data.records[i].conference?.name === 'Eastern') {
            easternTeamsTmp.push(res.data.records[i].teamRecords[j]);
          } else {
            westernTeamsTmp.push(res.data.records[i].teamRecords[j]);
          }
        }
      }

      setLeagueTeams([...teams]);
      setEasternTeams([...easternTeamsTmp]);
      setWesternTeams([...westernTeamsTmp]);
      setStanding(res.data);
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    setStanding(null);
    get_standing(); // fetch team standing stats from nhl api.
  }, [season]);

  const renderTeamRow = (team, i, isWildCard) => (
    <>
      <tr key={i}>
        <td>
          {i}
          {isWildCard && i <= 2 ? '*' : null}
        </td>
        <td>
          <img src={team_info[team.team.id]?.logo} alt="" width="40" height="40" />
        </td>
        <td>
          <b>{team.clinchIndicator}</b>
        </td>
        <td>{team.leagueRecord.wins + team.leagueRecord.losses + team.leagueRecord.ot}</td>
        <td>{team.leagueRecord.wins}</td>
        <td>{team.leagueRecord.losses}</td>
        <td>{team.leagueRecord.ot}</td>
        <td>
          {team.streak ? (
            <b style={team.streak.streakType === 'wins' ? { color: '#080' } : { color: '#b00' }}>
              {team.streak.streakCode}
            </b>
          ) : null}
        </td>
        <td>{team.regulationWins}</td>
        <td>{team.goalsAgainst}</td>
        <td>{team.goalsScored}</td>
        <td>
          <b>{team.points}</b>
        </td>
      </tr>
      {isWildCard && i === 2 ? (
        <tr>
          <th colSpan={12}> </th>
        </tr>
      ) : null}
    </>
  );

  const renderDivisionTeams = div => div.teamRecords.map(team => renderTeamRow(team, team.divisionRank, false));

  const renderHeader = divName => (
    <thead>
      <tr>
        <th colSpan={12}>{divName}</th>
      </tr>
      <tr>
        <th>#</th>
        <th colSpan={2}>Team</th>
        <th>G</th>
        <th>W</th>
        <th>L</th>
        <th>OT</th>
        <th>Streak</th>
        <th>RW</th>
        <th>GA</th>
        <th>GS</th>
        <th>PTS</th>
      </tr>
    </thead>
  );

  const renderWildCardStanding = conference => {
    let wildCardTeams = westernTeams;

    if (conference === 'Eastern') wildCardTeams = easternTeams;

    return (
      <table className="content-table">
        {renderHeader(conference)}
        <tbody>
          {standing.records
            .filter(div => div.conference?.name === conference)
            .map(div => (
              <>
                <tr key={div.division.name}>
                  <th colSpan={12}>{div.division.name}</th>
                </tr>
                {div.teamRecords
                  .filter(team => team.wildCardRank === '0')
                  .map((team, i) => renderTeamRow(team, i + 1, false))}
              </>
            ))}
          <tr>
            <th colSpan={12}>Wild Card</th>
          </tr>
          {wildCardTeams
            .filter(team => team.wildCardRank !== '0')
            .sort((team1, team2) => team1.wildCardRank - team2.wildCardRank)
            .map(team => renderTeamRow(team, team.wildCardRank, true))}
        </tbody>
      </table>
    );
  };

  const renderDivisionStanding = () =>
    standing.records.map(div => (
      <table className="content-table" key={div.division?.name}>
        {renderHeader(div.division?.name)}
        <tbody>{renderDivisionTeams(div)}</tbody>
      </table>
    ));

  const renderConferenceStanding = conference => {
    let conferenceTeams = westernTeams;

    if (conference === 'Eastern') conferenceTeams = easternTeams;

    return (
      <table className="content-table">
        {renderHeader(conference)}
        <tbody>
          {conferenceTeams
            .sort((team1, team2) => team1.conferenceRank - team2.conferenceRank)
            .map(team => renderTeamRow(team, team.conferenceRank, false))}
        </tbody>
      </table>
    );
  };

  const renderLeagueStanding = () => (
    <table className="content-table">
      {renderHeader('League')}
      <tbody>
        {leagueTeams
          .sort((team1, team2) => team1.leagueRank - team2.leagueRank)
          .map(team => renderTeamRow(team, team.leagueRank, false))}
      </tbody>
    </table>
  );

  if (easternTeams && westernTeams && leagueTeams && standing) {
    return (
      <div>
        <Tabs>
          <TabList>
            {wildCardAvailable ? <Tab>Wild Card</Tab> : null}
            <Tab>Divison</Tab>
            <Tab>Conference</Tab>
            <Tab>League</Tab>
          </TabList>
          {wildCardAvailable ? (
            <TabPanel>
              <>
                {renderWildCardStanding('Eastern')}
                {renderWildCardStanding('Western')}
              </>
            </TabPanel>
          ) : null}
          <TabPanel>{renderDivisionStanding()}</TabPanel>
          <TabPanel>
            {renderConferenceStanding('Eastern')}
            {renderConferenceStanding('Western')}
          </TabPanel>
          <TabPanel>{renderLeagueStanding()}</TabPanel>
        </Tabs>
      </div>
    );
  }
  return (
    <div className="cont">
      <h1>Trying to fetch teams data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
