import React, { useRef, useEffect, useState } from 'react'
import { Link } from "react-router-dom";

// css
import "./goalItem.css"

export const GoalItem = ({goalContent, statsData, team}) => {

    const videoRef = useRef()
    const [scorer, setScorer] = useState("")
    const [assists, setAssists] = useState("")
    const [goalType, setGoalType] = useState("")

    // const previousUrl = useRef(goalContent.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
        console.log(goalContent)
            videoRef?.current?.load();

            var goalInfos = goalContent.description.split(", ")

            var goalSubInfos = goalInfos[0].split(") ")

            setScorer(goalSubInfos[0] + ")")
            setGoalType(goalSubInfos[1]) //

            if(goalInfos.length > 2)
                setAssists(goalInfos[1].substr(9) + ", " + goalInfos[2])
            else if(goalInfos.length > 1)
                setAssists(goalInfos[1].substr(9))

    }, [goalContent])

    return (
        <div>
            <table className="goalItem">
                <tr>
                    <th width="75">Time:</th>
                    <td width="300">{goalContent.periodTime}</td>
                    <td rowSpan={4} width="225">
                        {
                            goalContent.highlight.playbacks?.length > 3?
                            <video width="224" height="126" poster={goalContent.highlight.image.cuts["248x140"]?.src} controls ref={videoRef}>
                                <source src={goalContent.highlight.playbacks[3].url} type="video/mp4"/>
                            </video> :
                            <a>No video yet</a>
                        }
                    </td>
                    
                </tr>
                <tr>
                    <th>Scorer:</th>
                    <td><Link to={"/playerInfo/" + goalContent.playerId } style={{ textDecoration: 'none', color: "#000099" }}>{scorer}</Link></td>
                </tr>
                <tr>
                    <th>Assists:</th>
                    <td>{assists}</td>
                </tr>
                <tr>
                    <th>Type:</th>
                    <td>{goalType}</td>
                </tr>

                
            </table>                
        </div>
    )    
}