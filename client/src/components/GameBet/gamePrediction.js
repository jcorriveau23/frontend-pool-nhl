import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'


// modals
import SendPredictionModal from '../../modals/sendPrediction';

import {Chart, ArcElement, Tooltip, Legend} from 'chart.js'
import { Pie } from 'react-chartjs-2'
Chart.register(ArcElement, Tooltip, Legend);




function GamePrediction({gameID, gameInfo, user, contract}) {

    const [gameData, setGameData] = useState(null)
    const [showSendPredictionModal, setShowSendPredictionModal] = useState(false)
    const [reRender, setReRender] = useState(false)

    useEffect(() => {
        contract.predictionGames(parseInt(gameID))
        .then(g => {
            let gData = {
                accumulatedWeisHome: parseInt(g.accumulatedWeisHome),
                accumulatedWeisAway: parseInt(g.accumulatedWeisAway),
                isDone: g.isDone,
                isCreated: g.isCreated,
                isHomeWin: g.isHomeWin,
                predictByMeWeisHome: 0,
                predictByMeWeisAway: 0
            }
            
            contract.get_user_bet_amount(parseInt(gameID))
            .then(values => {
                gData.predictByMeWeisHome = parseInt(values[0])
                gData.predictByMeWeisAway = parseInt(values[1])
                setGameData(gData)
            })
            .catch(e => {
                console.log(e.data.message)
                console.log(gData.isCreated)
                setGameData(gData)
            })
        })

    }, [gameID, reRender]);   // fetch the game predictions pools amount from the contract.

    const create_prediction_market = async() => {
        const overrides = {
            gasLimit: 120000 //optional 
        }

        await contract.createGame(gameInfo.gamePk, overrides)
    }

    if(gameData && gameInfo){
        if(gameData.isCreated){
            return (
                <div>
                    { showSendPredictionModal?
                        <SendPredictionModal 
                            user={user} 
                            gameID={gameID}
                            gameInfo={gameInfo} 
                            gamedata={gameData} 
                            contract={contract}
                            showSendPredictionModal={showSendPredictionModal}
                            setShowSendPredictionModal={setShowSendPredictionModal}
                            reRender={reRender}
                            setRerender={setReRender}
                        /> :
                        null
                    }
                    <div style={{width: 300, height: 300}}>
                        <Pie 
                            data={{
                                labels: [gameInfo.liveData.boxscore.teams.home.team.name, gameInfo.liveData.boxscore.teams.away.team.name],
                                datasets: [
                                    {
                                        label: 'Eth',
                                        data: [gameData.accumulatedWeisHome / (10**18), gameData.accumulatedWeisAway / (10**18)],   // from Weis to Ethers
                                        backgroundColor: ['rgba(255,99,132,0.2)', 'rgba(54,162,235,0.2)'],
                                        borderColor: ['rgba(255,99,132,1)', 'rgba(54,162,235,1)'],
                                        borderWidth: 3
                                    },
                                ], 
                            }}
                            />
                    </div>
                    <div>
                        <button 
                            onClick={() => setShowSendPredictionModal(true)}
                            disabled={gameData.isDone}
                        > 
                            {gameData.isDone? "Game is done" : "Predict"}
                        </button>
                    </div>
                    <div>
                        <table className="content-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>{gameInfo.liveData.boxscore.teams.home.team.name}</th>
                                    <th>{gameInfo.liveData.boxscore.teams.away.team.name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>Pool amount (Ethers)</th>
                                    <td>{gameData.accumulatedWeisHome / (10**18)}</td>
                                    <td>{gameData.accumulatedWeisAway / (10**18)}</td>
                                </tr>
                                <tr>
                                    <th>Invested by me (Ethers)</th>
                                    <td>{gameData.predictByMeWeisHome / (10**18)}</td>
                                    <td>{gameData.predictByMeWeisAway / (10**18)}</td>
                                </tr>
                                <tr>
                                    <th>My part (%)</th>
                                    <td>{gameData.accumulatedWeisHome !== 0? (gameData.predictByMeWeisHome / gameData.accumulatedWeisHome)*100 : "-"}</td>
                                    <td>{gameData.accumulatedWeisAway !== 0? (gameData.predictByMeWeisAway / gameData.accumulatedWeisAway)*100 : "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )    
        }
        else
            return (
                <div>
                    <h1>No Prediction market open for that game yet</h1>
                    <button onClick={create_prediction_market}>Create prediction market for that game</button>
                </div>
                
            )
       
    }
    else
        return(<h1>Trying to fetch Prediction game info.</h1>)
}

export default GamePrediction;