import React, { useRef, useEffect, useState } from 'react'
import { Link } from "react-router-dom";

// css
import "./goalItem.css"

// images
import logos, {team_name_from_id} from "../img/images"

export const GoalItem = ({goalData, gameContent}) => {

    const videoRef = useRef()
    const [goalContent, setGoalContent] = useState(null)
    const [scorer, setScorer] = useState("")
    const [firstAssist, setFirstAssist] = useState(null)
    const [secondAssist, setSecondAssist] = useState(null)
    const [rowSpan, setRowSpan] = useState(2)

    // const previousUrl = useRef(goalContent.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    //       3 - use the goal.eventId to map into the gameContent.media.milestones.items(item)
    //       4 - if goal.eventId == item.statsEventId, display the video.


    useEffect(() => {
        //console.log(goalData)
        //console.log(gameContent)
        videoRef?.current?.load();

        if(gameContent.media.milestones.items){
            for(var i = 0; i < gameContent.media.milestones.items.length; i++){
                if(parseInt(gameContent.media.milestones.items[i].statsEventId) === goalData.about.eventId)
                    setGoalContent(gameContent.media.milestones.items[i])
            }
        }

        var bFirstAssist = false

        goalData.players.map(player => {
            if(player.playerType === "Scorer")
                setScorer(player)

            if(player.playerType === "Assist"){
                if(bFirstAssist === false){
                    bFirstAssist = true
                    setFirstAssist(player)
                    setRowSpan(3)
                }
                else{
                    setSecondAssist(player)
                    setRowSpan(4)
                }
            }  
        })     

    }, [goalData])

    return (
        <div>
            <table className="goalItem">
                <tbody>
                    <tr>
                        <th rowSpan={rowSpan} width="30"><img src={logos[goalData.team.name] } alt="" width="30" height="30"/></th>
                        <th width="125">Time:</th>
                        <td width="250">{goalData.about.periodTime}</td>
                        <td rowSpan={rowSpan} width="225">
                            {
                                goalContent && goalContent.highlight.playbacks?.length > 3?
                                <video width="224" height="126" poster={goalContent.highlight.image.cuts["248x140"]?.src} controls ref={videoRef}>
                                    <source src={goalContent.highlight.playbacks[3].url} type="video/mp4"/>
                                </video> :
                                <p>No video yet</p>
                            }
                        </td>
                        
                    </tr>
                    {
                        scorer?
                            <tr>
                                <th>Scorer:</th>
                                <td><Link to={"/playerInfo/" + scorer.player.id } style={{ textDecoration: 'none', color: "#000099" }}>{scorer.player.fullName + " (" + scorer.seasonTotal + ")"}</Link></td>
                            </tr> : 
                            null
                    }
                    {
                        firstAssist?
                            <tr>
                                <th>1st Assists:</th>
                                <td><Link to={"/playerInfo/" + firstAssist.player.id } style={{ textDecoration: 'none', color: "#000099" }}>{firstAssist.player.fullName + " (" + firstAssist.seasonTotal + ")"}</Link></td>
                            </tr> :
                            null
                    }
                    {
                        secondAssist?
                            <tr>
                                <th>2nd Assists:</th>
                                <td><Link to={"/playerInfo/" + secondAssist.player.id } style={{ textDecoration: 'none', color: "#000099" }}>{secondAssist.player.fullName + " (" + secondAssist.seasonTotal + ")"}</Link></td>
                            </tr> :
                            null
                    }
                </tbody>
            </table>                
        </div>
    )    
}