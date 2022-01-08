import React, {useRef, useEffect } from 'react'

export const GoalItem = ({goalContent, statsData, team}) => {

    const videoRef = useRef()
    // const previousUrl = useRef(goalContent.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
            videoRef?.current.load();
    }, [goalContent])

    return (
        <div>
            <div>
                <b>{goalContent.title}</b>
            </div>
            <video width="224" height="126" controls ref={videoRef}>
                <source src={goalContent.playbacks[3].url} type="video/mp4"/>
            </video>
            
        </div>
    )
}