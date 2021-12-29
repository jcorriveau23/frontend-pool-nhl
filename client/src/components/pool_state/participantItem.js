import React from 'react'

export const ParticipantItem = ({name, ready}) => {

    return (
        <div>
            <p>{name}</p>
            <p>{ready? "Ready" : "Not Ready"}</p>
        </div>
    )
}