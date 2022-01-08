import React, {useRef, useEffect } from 'react'

export const OtherGameContent = ({gameContent}) => {

    const videoRef = useRef()
    // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
            videoRef?.current?.load();
    }, [gameContent])

    if(gameContent.media && gameContent.media.milestones.items?.length > 0)
    {
        return(
            <div>
                <h1>Other games content</h1>
                {gameContent.media.milestones.items.filter(highlight => {
                    return (highlight.type !== "GOAL" && highlight.highlight && highlight.highlight.playbacks) 
                }).map(highlight => {
                    return(
                        <div>
                            <div>
                                <b>Period: {highlight.highlightperiod}</b>
                                <b>{highlight.highlight.description}</b>
                            </div>
                            <video width="224" height="126" controls ref={videoRef}>
                                <source src={highlight.highlight.playbacks[3].url} type="video/mp4"/>
                            </video>
                        </div>
                    )
                } )}
            </div>
        )
    }
    else
        return (<h1></h1>)
    
}