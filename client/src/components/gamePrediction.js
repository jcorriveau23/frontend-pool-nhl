import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'

import { ethers } from 'ethers';
import NHLGamePredictionsABI from "../NHLGamePredictionsABI.json"

function GamePrediction({gameID}) {

    const [gameData, setGameData] = useState(null)

    useEffect(async() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log(NHLGamePredictionsABI)
        const contract = new ethers.Contract("0xd750D26d9b1ae1a31cC6274B8DB6864D2D8EF816", NHLGamePredictionsABI, provider)

        console.log(gameID)
        //console.log(parseInt(gameID))
        //console.log(contract.predictionGames)
        // const owner = await contract.owner
        // console.log( owner )
        console.log( await provider.getNetwork() )

        const g = await contract.predictionGames(parseInt(gameID))
        console.log(parseInt(g.accumulatedWeisFor))
        
        let gData = {
            accumulatedWeisFor: parseInt(g.accumulatedWeisFor),
            accumulatedWeisAgainst: parseInt(g.accumulatedWeisAgainst)
        }
        setGameData(gData)

    }, []); // fetch all todays games info from nhl api on this component mount.

    if(gameData){
        return (
            <div>
                <h1>{gameData.accumulatedWeisFor}</h1>
                <h1>{gameData.accumulatedWeisAgainst}</h1>
            </div>
        )    
    }
    else
        return(<h1>Trying to fetch Prediction game info.</h1>)
    
}

export default GamePrediction;