import React, {useRef, useEffect } from 'react'

export const GoalItem = ({goalContent, statsData, team}) => {

    const videoRef = useRef()
    // const previousUrl = useRef(goalContent.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
        console.log(goalContent)
            videoRef?.current?.load();
    }, [goalContent])

    if(goalContent.playbacks?.length > 3)
    {
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
    else
        return(<h1></h1>)

    
}