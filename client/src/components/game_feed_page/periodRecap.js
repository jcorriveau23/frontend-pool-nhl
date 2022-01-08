import React, {useRef, useEffect } from 'react'

// component
import { GoalItem } from './goalItem'

export const PeriodRecap = ({gameContent, period}) => {

    const videoRef = useRef()
    // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
            videoRef?.current?.load();
    }, [gameContent])

    if(gameContent.media && gameContent.media.milestones.items)
    {
        return(
            <div>
                <h1>{period === "4"? "OT" : "Period: " + period}</h1>
                {gameContent.media.milestones.items.filter(highlight => {
                    return (highlight.type === "GOAL" && highlight.period === period) 
                }).map(highlight => {
                    return(
                        <GoalItem goalContent={highlight.highlight}></GoalItem>
                    )
                } )}
            </div>
        )
    }
    else
        return (<h1></h1>)
    
}