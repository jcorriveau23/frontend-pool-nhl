import React from 'react'
import Cookies from 'js-cookie';

import { Link } from "react-router-dom"

export const ParticipantItem = ({name, ready}) => {

    return (
        <div>
            <p>{name}</p>
            <p>{ready? "Ready" : "Not Ready"}</p>
        </div>
    )
}