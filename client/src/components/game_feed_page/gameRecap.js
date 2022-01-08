import React, {useRef, useEffect } from 'react'

export const GameRecap = ({gameContent, isEditorial}) => {

    const videoRef = useRef()
    // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {

            videoRef?.current?.load();
    }, [gameContent])

    if(isEditorial && gameContent.editorial && gameContent.editorial.recap.items?.length > 0)
    {
        return (
            <div>
                <div>
                    <h1>{gameContent.title}</h1>
                    <b>{gameContent.description}</b>
                </div>
                <video width="896" height="504" controls ref={videoRef}>
                    <source src={gameContent.editorial.recap.items[0].media.playbacks[3].url} type="video/mp4"/>
                </video>
                
                
            </div>
        )
    }
    else if(!isEditorial && gameContent.media && gameContent.media.milestones.items?.length > 0 )
    {
        return(
            <div>
                <div>
                    <h1>{gameContent.title}</h1>
                    <b>{gameContent.description}</b>
                </div>
                <video width="896" height="504" controls ref={videoRef}>
                    <source src={gameContent.media.epg[2].items[0].playbacks[3].url} type="video/mp4"/>
                </video>
            </div>
        )
    }
    else
        return (<h1></h1>)
    
}