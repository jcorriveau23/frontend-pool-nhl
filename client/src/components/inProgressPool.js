import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import logos from "./img/images"
import Tabs from "./Tabs"

function InProgressPool({ username, poolName, poolInfo }) {

    const [playersStats, setPlayersStats] = useState({});
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        if ( poolName ) {
            const requestOptions3 = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token'), 'pool_name': poolName}
            };
            fetch('../pool/get_pool_stats', requestOptions3)
            .then(response => response.json())
            .then(data => {
                if(data.success === "False")
                {
                    // this.props.history.push('/pool_list');
                }
                else
                {
                    //TODO: Store the pool stats into state
                    calculate_pool_stats(data.players)
                }
            })
        }
        return () => {
        }
    }, []); // only run on this component mount and unmount

    const calculate_pool_stats = async (players_stats) => {
        var stats = {}
        var pooler
        var player
  
        var rank = []
  
        for(var i = 0; i < poolInfo.participants.length; i++){
            pooler = poolInfo.participants[i]
    
            stats[pooler] = {}
            stats[pooler]["chosen_forward"] = []
    
            stats[pooler]["forwards_total_pts"] = 0 
            stats[pooler]["defenders_total_pts"] = 0
            stats[pooler]["goalies_total_pts"] = 0
            stats[pooler]["reservists_total_pts"] = 0
    
            for(var j = 0; j < poolInfo.context[pooler].chosen_forward.length; j++){
                player = await players_stats.find(p => p.name === poolInfo.context[pooler].chosen_forward[j].name)

                player["pool_points"] = poolInfo.forward_pts_goals*player.stats.goals + poolInfo.forward_pts_assists*player.stats.assists //+ hat trick
                stats[pooler]["forwards_total_pts"] += poolInfo.forward_pts_goals*player.stats.goals + poolInfo.forward_pts_assists*player.stats.assists
    
                stats[pooler]["chosen_forward"].push(player)
            }
    
            stats[pooler]["chosen_defender"] = []
    
            for(var j = 0; j < poolInfo.context[pooler].chosen_defender.length; j++){
                player = await players_stats.find(p => p.name === poolInfo.context[pooler].chosen_defender[j].name)

                player["pool_points"] = poolInfo.defender_pts_goals*player.stats.goals + poolInfo.defender_pts_assits*player.stats.assists //+ hat trick 
                stats[pooler]["defenders_total_pts"] += poolInfo.defender_pts_goals*player.stats.goals + poolInfo.defender_pts_assits*player.stats.assists //+ hat trick  
                
                stats[pooler]["chosen_defender"].push(player)
            }
    
            stats[pooler]["chosen_goalies"] = []
    
            for(var j = 0; j < poolInfo.context[pooler].chosen_goalies.length; j++){
                player = await players_stats.find(p => p.name === poolInfo.context[pooler].chosen_goalies[j].name)

                player["pool_points"] = poolInfo.goalies_pts_wins*player.stats.wins + poolInfo.goalies_pts_shutouts*player.stats.shutouts
                stats[pooler]["goalies_total_pts"] += poolInfo.goalies_pts_wins*player.stats.wins + poolInfo.goalies_pts_shutouts*player.stats.shutouts
    
                stats[pooler]["chosen_goalies"].push(player)
            }
    
            stats[pooler]["chosen_reservist"] = []
    
            for(var j = 0; j < poolInfo.context[pooler].chosen_reservist.length; j++){
                player = await players_stats.find(p => p.name === poolInfo.context[pooler].chosen_reservist[j].name)

                if(player.position === "G")
                {
                    player["pool_points"] = poolInfo.goalies_pts_wins*player.stats.wins + poolInfo.goalies_pts_shutouts*player.stats.shutouts
                    stats[pooler]["reservists_total_pts"] += poolInfo.goalies_pts_wins*player.stats.wins + poolInfo.goalies_pts_shutouts*player.stats.shutouts
                }
                else if(player.position === "F")
                {
                    player["pool_points"] = poolInfo.forward_pts_goals*player.stats.goals + poolInfo.forward_pts_assists*player.stats.assists //+ hat trick 
                    stats[pooler]["reservists_total_pts"] += poolInfo.forward_pts_goals*player.stats.goals + poolInfo.forward_pts_assists*player.stats.assists //+ hat trick 
                }
                else
                {
                    player["pool_points"] = poolInfo.defender_pts_goals*player.stats.goals + poolInfo.defender_pts_assits*player.stats.assists //+ hat trick
                    stats[pooler]["reservists_total_pts"] +=  poolInfo.defender_pts_goals*player.stats.goals + poolInfo.defender_pts_assits*player.stats.assists //+ hat trick
                }
                stats[pooler]["chosen_reservist"].push(player)
            }
    
            stats[pooler]["total_pts"] = stats[pooler]["forwards_total_pts"] + stats[pooler]["defenders_total_pts"] + stats[pooler]["goalies_total_pts"] + stats[pooler]["reservists_total_pts"]
    
            var pooler_global_stats = {
                name: pooler, 
                defenders_total_pts: stats[pooler]["defenders_total_pts"],
                forwards_total_pts: stats[pooler]["forwards_total_pts"],
                goalies_total_pts: stats[pooler]["goalies_total_pts"],
                reservists_total_pts: stats[pooler]["reservists_total_pts"],
                total_pts: stats[pooler]["total_pts"]
            }
    
            rank.push(pooler_global_stats)
        }

        rank = await sort_by_player_member("total_pts", rank)
        
        setRanking( [...rank] )
        setPlayersStats({...stats })
    }

    const sort_by_player_member = async (playerMember, array) =>{
        // TODO: try to simplified this into no if at all
        if(playerMember !== "name" && playerMember !== "team")
            array.sort(function(a, b) {
                return b[playerMember] - a[playerMember] ;
            });

        else{
            array.sort(function(a, b) {
                if(a[playerMember] < b[playerMember]) {return -1;}
                if(a[playerMember] > b[playerMember]) {return 1;}
                return 0;
            });
        }

        return array
    }

    const download_csv = (pool) => {
        var csv = 'Player Name,Team\n';
  
        for(var i = 0; i < pool.number_poolers; i++){
          var pooler = pool.participants[i]
          
          // forward
          csv += pooler + "'s forwards\n"
          for(var j= 0; j < pool.context[pooler].chosen_forward.length; j++){
            csv += pool.context[pooler].chosen_forward[j].name + ', ' + pool.context[pooler].chosen_forward[j].team
            csv += "\n";
          }
          csv += "\n";
  
          // defenders
          csv += pooler + "'s defenders\n"
          for(var j= 0; j < pool.context[pooler].chosen_defender.length; j++){
            csv += pool.context[pooler].chosen_defender[j].name + ', ' + pool.context[pooler].chosen_defender[j].team
            csv += "\n";
          }
          csv += "\n";
  
          // goalies
          csv += pooler + "'s goalies\n"
          for(var j= 0; j < pool.context[pooler].chosen_goalies.length; j++){
            csv += pool.context[pooler].chosen_goalies[j].name + ', ' + pool.context[pooler].chosen_goalies[j].team
            csv += "\n";
          }
          csv += "\n";
  
          // reservist
          csv += pooler + "'s reservists\n"
          for(var j= 0; j < pool.context[pooler].chosen_reservist.length; j++){
            csv += pool.context[pooler].chosen_reservist[j].name + ', ' + pool.context[pooler].chosen_reservist[j].team
            csv += "\n";
          }
          csv += "\n";
          csv += "\n-------, -------, -------, -------\n";
          csv += "\n";
        }
  
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = poolInfo.name + '.csv';
        hiddenElement.click();
  
    }

    const render_tabs_choice_stats = () => {
        if(poolInfo['participants']){
          var array = poolInfo['participants']

          // replace pooler user name to be first
          var index = array.findIndex(isUser)
          array.splice(index, 1)
          array.splice(0, 0, username)

            return( 
                <Tabs>
                    {array.map(pooler =>
                        <div label={pooler} >
                            <Tabs>
                                <div label="Forward">
                                    <table class="content-table">
                                        <tr>
                                            <th>#</th>
                                            <th>name</th>
                                            <th>team</th>
                                            <th>Goal</th>
                                            <th>Assist</th>
                                            <th>Pts</th>
                                            <th>Pts (pool)</th>
                                        </tr>
                                        {render_forward_stats(pooler)}
                                    </table>
                                    </div>
                                    <div label="Defenders">
                                        <table class="content-table">
                                            <tr>
                                                <th>#</th>
                                                <th>name</th>
                                                <th>team</th>
                                                <th>Goal</th>
                                                <th>Assist</th>
                                                <th>Pts</th>
                                                <th>Pts (pool)</th>
                                            </tr>
                                            {render_defender_stats(pooler)}
                                        </table>
                                    </div>
                                    <div label="Goalies">
                                        <table class="content-table">
                                            <tr>
                                                <th>#</th>
                                                <th>name</th>
                                                <th>team</th>
                                                <th>Win</th>
                                                <th>Loss</th>
                                                <th>Shutout</th>
                                                <th>Save %</th>
                                                <th>Pts (pool)</th>
                                            </tr>
                                            {render_goalies_stats(pooler)}
                                        </table>
                                    </div>
                                    <div label="Reservists">
                                        <table class="content-table">
                                            <tr>
                                                <th>#</th>
                                                <th>name</th>
                                                <th>team</th>
                                            </tr>
                                            {render_reservist_stats(pooler)}
                                        </table>
                                    </div>
                            </Tabs>
                        </div>
                    )}
                </Tabs>
            
            )}

        else{
          return
        }
    }

    const render_tabs_pool_rank = () => {
        if(ranking){
            return(
                ranking.map((pooler_stats, index) =>
                    <tr>
                        <td>{index + 1}</td>
                        <td>{pooler_stats.name}</td>
                        <td>{pooler_stats.forwards_total_pts}</td>
                        <td>{pooler_stats.defenders_total_pts}</td>
                        <td>{pooler_stats.goalies_total_pts}</td>
                        <td>{pooler_stats.reservists_total_pts}</td>
                        <td>{pooler_stats.total_pts}</td>
                    </tr>
                )
            )
        }
        else{
          return
        }
    }

    const render_defender_stats = (pooler) => {
        if(playersStats[pooler]){
            return (
            <>
                {playersStats[pooler]['chosen_defender'].map((player, index) =>
                <tr>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>
                        <img src={logos[player.team]} width="30" height="30"></img>
                    </td>
                    <td>{player.stats.goals}</td>
                    <td>{player.stats.assists}</td>
                    <td>{player.stats.pts}</td>
                    <td>{player.pool_points}</td>
                </tr> 
                )}
                <tr>
                    <th>total</th>
                    <th> - </th>
                    <th> - </th>
                    <th> - </th>
                    <th> - </th>
                    <th> - </th>
                    <th>{playersStats[pooler]['defenders_total_pts']}</th>
                </tr>
            </>
            )
        

        }
        else{
          return
        }
      }

    const render_forward_stats = (pooler) => {
        if(playersStats[pooler]){
            console.log(playersStats[pooler])
            return( 
            <>
                {playersStats[pooler]['chosen_forward'].map((player, index) =>
                    <tr class="content-table">
                        <td>{index + 1}</td>
                        <td>{player.name}</td>
                        <td>
                            <img src={logos[player.team]} width="30" height="30"></img>
                        </td>
                        <td>{player.stats.goals}</td>
                        <td>{player.stats.assists}</td>
                        <td>{player.stats.pts}</td>
                        <td>{player.pool_points}</td>
                    </tr>
                )}
                <tr>
                    <th>total</th>
                    <th> - </th>
                    <th> - </th>
                    <th> - </th>
                    <th> - </th>
                    <th> - </th>
                    <th>{playersStats[pooler]['forwards_total_pts']}</th>
                </tr>
            </>
        )
        }
        else{
            return
        }
    }

    const render_reservist_stats = (pooler) => {
    if(playersStats[pooler]){
        
        return (
        <>
        
        {playersStats[pooler]['chosen_reservist'].map((player, index) =>
        <tr>
        <td>{index + 1}</td>
        <td>{player.name}</td>
        <td>
            <img src={logos[player.team]} width="30" height="30"></img>
        </td>
        <td>{player.stats.goals}</td>
        <td>{player.stats.assists}</td>
        <td>{player.stats.pts}</td>
        <td>{player.pool_points}</td>
        </tr>
    )}
    <tr>
        <th>total</th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th>{playersStats[pooler]['reservists_total_pts']}</th>
        </tr>
    </>

        )
    }
    else{
        return
    }
    }

    const render_goalies_stats = (pooler) => {
    if(playersStats[pooler]){
        
        return (
        <>
        {playersStats[pooler]['chosen_goalies'].map((player, index) =>
        <tr>
        <td>{index + 1}</td>
        <td>{player.name}</td>
        <td>
            <img src={logos[player.team]} width="30" height="30"></img>
        </td>
        <td>{player.stats.wins}</td>
        <td>{player.stats.losses}</td>
        <td>{player.stats.shutouts}</td>
        <td>{player.stats.savePercentage}</td>
        <td>{player.pool_points}</td>

        </tr>
    )
        }
        <tr>
        <th>total</th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th> - </th>
        <th>{playersStats[pooler]['goalies_total_pts']}</th>
        </tr>
        </>
        )

    }

    else{
        return
    }
    }

    const isUser = (participant) => {
        return participant === username
    }


    if(poolInfo){
        return(
            <div class="back-site">
                <h1>Pool in progress...</h1>
                <div class="floatLeft">
                <div>
                        {render_tabs_choice_stats()}
                </div>
                </div>
                <div class="floatRight">
                    <h1>Today's ranking</h1>
                    <table class="content-table">
                        <tr>
                            <th>rank</th>
                            <th>pooler name</th>
                            <th>forwards (pts)</th>
                            <th>defenders (pts)</th>
                            <th>goalies (pts)</th>
                            <th>reservists (pts)</th>
                            <th>total (pts)</th>
                        </tr>
                        {render_tabs_pool_rank()}
                    </table>
                </div>
                <button onClick={() => download_csv(poolInfo)}>Download CSV</button>
            </div>
        )
    }
    else{
        return(
            <div>
                <h1>trying to fetch pool data info2...</h1>
            </div>
        )
    }
    
  
  }
  export default InProgressPool;