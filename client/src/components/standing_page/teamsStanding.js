// https://statsapi.web.nhl.com/api/v1/standings: this call gives all the information we need to make a ranking team board by division conference or league.

import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import logos from '../img/logos';

// css
import './teamStanding.css';
import '../react-tabs.css';

function TeamsStanding({ data }) {
  const [easternTeams, setEasternTeams] = useState(null);
  const [westernTeams, setWesternTeams] = useState(null);
  const [leagueTeams, setLeagueTeams] = useState(null);

  useEffect(() => {
    const teams = [];
    const easternTeams_temp = [];
    const westernTeams_temp = [];

    for (let i = 0; i < data.records.length; i += 1) {
      for (let j = 0; j < data.records[i].teamRecords.length; j += 1) {
        teams.push(data.records[i].teamRecords[j]);

        if (data.records[i].conference.name === 'Eastern') easternTeams_temp.push(data.records[i].teamRecords[j]);
        else westernTeams_temp.push(data.records[i].teamRecords[j]);
      }
    }

    setLeagueTeams([...teams]);
    setEasternTeams([...easternTeams_temp]);
    setWesternTeams([...westernTeams_temp]);
  }, []);

  const renderTeamRow = (team, i) => (
    <tr key={i}>
      <td>{i}</td>
      <td>
        <img src={logos[team.team.name]} alt="" width="30" height="30" />
      </td>
      <td>{team.leagueRecord.wins + team.leagueRecord.losses + team.leagueRecord.ot}</td>
      <td>{team.leagueRecord.wins}</td>
      <td>{team.leagueRecord.losses}</td>
      <td>{team.leagueRecord.ot}</td>
      <td>
        <b style={team.streak.streakType === 'wins' ? { color: '#080' } : { color: '#b00' }}>
          {team.streak.streakCode}
        </b>
      </td>
      <td>{team.regulationWins}</td>
      <td>{team.goalsAgainst}</td>
      <td>{team.goalsScored}</td>
      <td>
        <b>{team.points}</b>
      </td>
    </tr>
  );

  const renderDivisionTeams = div => div.teamRecords.map(team => renderTeamRow(team, team.divisionRank));

  const renderHeader = divName => (
    <thead>
      <tr>
        <th colSpan={11}>{divName}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>Team</th>
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
        {data.records
          .filter(div => div.conference.name === conference)
          .map(div => (
            <>
              <tr key={div.division.name}>
                <th colSpan={11}>{div.division.name}</th>
              </tr>
              {div.teamRecords.filter(team => team.wildCardRank === '0').map((team, i) => renderTeamRow(team, i + 1))}
            </>
          ))}
        <tr>
          <th colSpan={11}>Wild Card</th>
        </tr>
        {wildCardTeams
          .filter(team => team.wildCardRank !== '0')
          .sort((team1, team2) => team1.wildCardRank - team2.wildCardRank)
          .map(team => renderTeamRow(team, team.wildCardRank))}
      </table>
    );
  };

  const renderDivisionStanding = () =>
    data.records.map(div => (
      <table className="content-table">
        {renderHeader(div.division.name)}
        <tbody>{renderDivisionTeams(div)}</tbody>
      </table>
    ));

  const renderConferenceStanding = conference => {
    let conferenceTeams = westernTeams;

    if (conference === 'Eastern') conferenceTeams = easternTeams;

    return (
      <table className="content-table">
        {renderHeader(conference)}
        {conferenceTeams
          .sort((team1, team2) => team1.conferenceRank - team2.conferenceRank)
          .map(team => renderTeamRow(team, team.conferenceRank))}
      </table>
    );
  };

  const renderLeagueStanding = () => (
    <table className="content-table">
      {renderHeader('League')}
      {leagueTeams
        .sort((team1, team2) => team1.leagueRank - team2.leagueRank)
        .map(team => renderTeamRow(team, team.leagueRank))}
    </table>
  );

  if (easternTeams && westernTeams && leagueTeams) {
    return (
      <div>
        <Tabs>
          <TabList>
            <Tab>Wild Card</Tab>
            <Tab>Divison</Tab>
            <Tab>Conference</Tab>
            <Tab>League</Tab>
          </TabList>
          <TabPanel>
            {renderWildCardStanding('Eastern')}
            {renderWildCardStanding('Western')}
          </TabPanel>
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
  return <h1>Preparing Standings...</h1>;
}
export default TeamsStanding;
