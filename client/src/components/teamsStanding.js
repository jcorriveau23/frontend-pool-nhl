// https://statsapi.web.nhl.com/api/v1/standings: this call gives all the information we need to make a ranking team board by division conference or league.

import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import logos from "./img/images"

function TeamsStanding({data}) {

    const renderDivisionTeams = (div) => div.teamRecords.map((team, i) => {
        return (
            <tr key={i}>
                <td>{i + 1}</td>
                <td>
                    <img src={logos[ team.team.name ]} alt="" width="30" height="30"></img>
                </td>
                <td>{team.leagueRecord.wins + team.leagueRecord.losses + team.leagueRecord.ot}</td> 
                <td>{team.leagueRecord.wins}</td>
                <td>{team.leagueRecord.losses}</td>
                <td>{team.leagueRecord.ot}</td>
                <td>{team.regulationWins}</td>
                <td>{team.goalsAgainst}</td>
                <td>{team.goalsScored}</td>
                <td>{team.points}</td>
            </tr>
        )
    })    

    const renderHeader = () => {
        return (
            <thead>
                <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>G</th>
                    <th>W</th>
                    <th>L</th>
                    <th>OT</th>
                    <th>RW</th>
                    <th>GA</th>
                    <th>GS</th>
                    <th>PTS</th>
                </tr>
            </thead>
        )
    }

    const renderDivisionStanding = () => {
        return (
            <Tabs>
                <TabList>
                    {data["records"].map((div, i) => <Tab key={i}>{div.division.name}</Tab>)}
                </TabList>
                {data["records"].map((div, i)  => {
                    return <TabPanel key={i}>
                        <div>
                            <table className="content-table">
                                {renderHeader()}
                                <tbody>
                                    {renderDivisionTeams(div)}
                                </tbody>
                            </table>
                        </div>  
                    </TabPanel>
                })}
            </Tabs>
        )     
    }

    return (
        <div>
            <h1>Teams Standing</h1>
            {renderDivisionStanding()}
        </div>
    )

        
}
export default TeamsStanding;