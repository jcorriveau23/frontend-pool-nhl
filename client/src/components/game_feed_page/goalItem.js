import React, {useRef, useEffect } from 'react'
import Cookies from 'js-cookie';

export const GoalItem = ({goalContent, statsData, team}) => {

    const videoRef = useRef()
    const previousUrl = useRef(goalContent.playbacks[3].url)

    useEffect(() => {
            videoRef?.current.load();
    }, [goalContent])

    return (
        <div>
            <p>{goalContent.title}</p>
            <video width="224" height="126" controls ref={videoRef}>
                <source src={goalContent.playbacks[3].url} type="video/mp4"/>
            </video>
            
        </div>
    )
}