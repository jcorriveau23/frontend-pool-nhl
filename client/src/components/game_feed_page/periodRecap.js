import React, {useRef, useEffect, useState } from 'react'

// component
import { GoalItem } from './goalItem'

// css
import "./goalItem.css"

export const PeriodRecap = ({gameInfo, gameContent, period}) => {

    const videoRef = useRef()
    const [isItem, setIsItem] = useState(false)
    // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
        console.log(gameInfo)
        // console.log(gameContent)
        videoRef?.current?.load();
    }, [gameContent])

    if(gameInfo.liveData && gameInfo.liveData.plays)
    {
        return(
            <div>
                <table className='goalItem'>
                    <thead>
                        {
                            isItem?
                            <tr>
                                <th>{ period === "4"? "OT" : "Period: " + period}</th>
                            </tr> : 
                            null
                        }
                    </thead>
                    <tbody>
                        {gameInfo.liveData.plays.scoringPlays.filter(i => {
                            return gameInfo.liveData.plays.allPlays[i].about.period === parseInt(period)
                        }).map((i) => {
                            if(isItem === false)
                                setIsItem(true)
                            return(
                                <tr key={i}>
                                    <td>
                                        <GoalItem goalData ={gameInfo.liveData.plays.allPlays[i]} gameContent={gameContent}></GoalItem>
                                    </td>
                                </tr>
                            )
                        } )}
                    </tbody>
                </table>
            </div>
        )
    }
    else
        return (<h1> </h1>)
    
}