import React, {useRef, useEffect, useState } from 'react'

export const GameRecap = ({gameContent, isEditorial}) => {

    const videoRef = useRef()
    const [prevGameContent, setPrevGameContent] = useState(null)
    // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

    useEffect(() => {
        if(prevGameContent !== gameContent)
        {
            videoRef?.current?.load();
            setPrevGameContent(gameContent)
        }
    }, [gameContent])

    if(isEditorial && gameContent.editorial && gameContent.editorial.recap.items?.length > 0)
    {
        return (
            <div>
                <table>
                    <tr>
                        <th>{gameContent.title}</th>
                    </tr>
                    <tr>
                        <th>{gameContent.description}</th>
                    </tr>
                    <tr>
                        <video width="598" height="336" controls ref={videoRef}>
                            <source src={gameContent.editorial.recap.items[0].media.playbacks[3].url} type="video/mp4"/>
                        </video>
                    </tr>
                </table>
            </div>
        )
    }
    else if(!isEditorial && gameContent.media && gameContent.media.epg[2].items?.length > 0 )
    {
        return(
            <div>
                <table>
                    <tr>
                        <th>{gameContent.title}</th>
                    </tr>
                    <tr>
                        <th>{gameContent.description}</th>
                    </tr>
                    <tr>
                        <video width="598" height="336" controls ref={videoRef}>
                            <source src={gameContent.media.epg[2].items[0].playbacks[3].url} type="video/mp4"/>
                        </video>
                    </tr>
                </table>
            </div>
        )
    }
    else
        return (<h1>No Recap videos available yet</h1>)
    
}