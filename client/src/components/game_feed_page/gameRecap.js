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

    if(isEditorial && gameContent.editorial && gameContent.media.epg[3].items?.length > 0)
    {
        console.log(gameContent)
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
                        <video width="700" height="394" poster={gameContent.media.epg[3].items[0].image.cuts["640x360"]?.src} controls ref={videoRef}>
                            <source src={gameContent.media.epg[3].items[0].playbacks[3].url} type="video/mp4"/>
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
                        <video width="700" height="394" controls  poster={gameContent.media.epg[2].items[0].image.cuts["640x360"]?.src} ref={videoRef}>
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