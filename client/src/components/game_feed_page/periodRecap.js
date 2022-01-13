import React, {useRef, useEffect, useState } from 'react'

// component
import { GoalItem } from './goalItem'

// css
import "./goalItem.css"

export const PeriodRecap = ({gameContent, period}) => {

    const videoRef = useRef()
    const [isItem, setIsItem] = useState(false)
    // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
            videoRef?.current?.load();
    }, [gameContent])

    if(gameContent.media && gameContent.media.milestones.items )
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
                        {gameContent.media.milestones.items.filter(highlight => {
                            return (highlight.type === "GOAL" && highlight.period === period) 
                        }).map((highlight, i) => {
                            if(isItem === false)
                                setIsItem(true)
                            return(
                                <tr key={i}>
                                    <td>
                                        <GoalItem goalContent={highlight}></GoalItem>
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
        return (<h1>Nothing to display</h1>)
    
}