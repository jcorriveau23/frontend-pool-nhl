// https://statsapi.web.nhl.com/api/v1/standings: this call gives all the information we need to make a ranking team board by division conference or league.

import React from 'react'
import logos from "./img/images"

import Tabs from "./Tabs"

function TeamsStanding({data}) {

    const renderDivisionTeams = (div) => div.teamRecords.map((team, index) => {
        return (
            <tr>
                <td>{index + 1}</td>
                <td>
                    <img src={logos[ team.team.name ]} width="30" height="30"></img>
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
        <>
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
        </>
        )
    }

    const renderDivisionStanding = () => data["records"].map(div => {
            return <div label={div.division.name}>
                <div>
                    <table class="content-table">
                        {renderHeader()}
                        {renderDivisionTeams(div)}
                    </table>
                </div>
            </div>         
    })

    return (
        <div>
            <h1>Teams Standing</h1>
            <Tabs>
            {renderDivisionStanding()}
            </Tabs>
        </div>
    )

        
}
export default TeamsStanding;