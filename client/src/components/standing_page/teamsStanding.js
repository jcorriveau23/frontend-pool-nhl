// https://statsapi.web.nhl.com/api/v1/standings: this call gives all the information we need to make a ranking team board by division conference or league.

import React, { useEffect, useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import logos from "../img/images"

// css
import "./teamStanding.css"
import '../react-tabs.css';

// TODO: for conference rank use conferenceRank member
//       for league rank use leagueRank member

function TeamsStanding({data}) {
    const [easternTeams, setEasternTeams] = useState(null)
    const [westernTeams, setWesternTeams] = useState(null)
    const [leagueTeams, setLeagueTeams] = useState(null)

    useEffect(() => {
        var teams = []
        var easternTeams = []
        var westernTeams = []

        for(var i = 0; i < data.records.length; i++){
            for(var j = 0; j < data.records[i].teamRecords.length; j++){
                teams.push(data.records[i].teamRecords[j])
                
                if(data.records[i].conference.name === "Eastern")
                    easternTeams.push(data.records[i].teamRecords[j])
                else
                    westernTeams.push(data.records[i].teamRecords[j])
            }
        }

        console.log(easternTeams)

        setLeagueTeams([...teams])
        setEasternTeams([...easternTeams])
        setWesternTeams([...westernTeams])

    }, [])

    const renderTeamRow = (team, i) => {
        return(
            <tr key={i}>
            <td>{i}</td>
            <td>
                <img src={logos[ team.team.name ]} alt="" width="30" height="30"></img>
            </td>
            <td>{team.leagueRecord.wins + team.leagueRecord.losses + team.leagueRecord.ot}</td> 
            <td>{team.leagueRecord.wins}</td>
            <td>{team.leagueRecord.losses}</td>
            <td>{team.leagueRecord.ot}</td>
            <td><b style={team.streak.streakType === "wins"? {color: "#080"} : {color: "#b00"}}>{team.streak.streakCode}</b></td>
            <td>{team.regulationWins}</td>
            <td>{team.goalsAgainst}</td>
            <td>{team.goalsScored}</td>
            <td><b>{team.points}</b></td>
        </tr>
        )
    }

    const renderDivisionTeams = (div) => {
        return(
            div.teamRecords.map((team, i) => {
                return (
                    renderTeamRow(team, team.divisionRank)
                )
            })
        )
    }

    const renderHeader = (divName) => {
        return (
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
        )
    }

    const renderWildCardStanding = (conference) => {
        var wildCardTeams = westernTeams

        if(conference === "Eastern")
            wildCardTeams = easternTeams

        return(
            <table className="content-table">
                {renderHeader(conference)}
                {
                    data.records.filter(div => {
                        return div.conference.name === conference
                    }).map((div, i) => {
                        return(
                            <>
                                <tr key={i}>
                                    <th colSpan={11}>{div.division.name}</th>
                                </tr>
                                {
                                    div.teamRecords.filter(team => {
                                        return team.wildCardRank === "0"
                                    }).map((team, i) => {
                                        return(
                                            renderTeamRow(team, i + 1)
                                        )
                                    })
                                }
                            </>                            
                        )
                    })
                } 
                <tr>
                    <th colSpan={11}>Wild Card</th>
                </tr>
                {
                    wildCardTeams.filter(team => {
                        return team.wildCardRank !== "0"
                    }).sort((team1, team2) => {
                        return team1.wildCardRank - team2.wildCardRank
                    }).map(team => {
                        return(
                            renderTeamRow(team, team.wildCardRank)
                        )
                    })  
                }
            </table>
        )
    }

    const renderDivisionStanding = () => {
        return(
            data.records.map((div, i)  => {
                return (
                    <table className="content-table">
                        {renderHeader(div.division.name)}
                        <tbody>
                            {renderDivisionTeams(div)}
                        </tbody>
                    </table>
                )
                    
            }) 
        )
    }

    const renderConferenceStanding = (conference) => {
        var conferenceTeams = westernTeams

        if(conference === "Eastern")
        conferenceTeams = easternTeams

        return(
            <table className="content-table">
                {renderHeader(conference)}
                {
                    conferenceTeams.sort((team1, team2) => {
                        return team1.conferenceRank - team2.conferenceRank
                    }).map(team => {
                        return(
                            renderTeamRow(team, team.conferenceRank)
                        )
                    })
                }
            </table>
        )
    }

    const renderLeagueStanding = () => {
        return(
            <table className="content-table">
                {renderHeader("League")}
                {
                    leagueTeams.sort((team1, team2) => {
                        return team1.leagueRank - team2.leagueRank
                    }).map(team => {
                        return(
                            renderTeamRow(team, team.leagueRank)
                        )
                    })
                }
            </table>
        )
    }

    if(easternTeams && westernTeams && leagueTeams){
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
                        {renderWildCardStanding("Eastern")}
                        {renderWildCardStanding("Western")}
                    </TabPanel>
                    <TabPanel>{renderDivisionStanding()}</TabPanel>
                    <TabPanel>
                        {renderConferenceStanding("Eastern")}
                        {renderConferenceStanding("Western")}
                    </TabPanel>
                    <TabPanel>{renderLeagueStanding()}</TabPanel>
                </Tabs>
            </div>
        )
    }
    else
        return(<h1>Preparing Standings...</h1>)   
}
export default TeamsStanding;