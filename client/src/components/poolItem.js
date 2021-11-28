import React from 'react'
import Cookies from 'js-cookie';

import { Link } from "react-router-dom"

export const PoolItem = ({name, owner, username, poolDeleted, setPoolDeleted}) => {
    
    const delete_pool = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')},
            body: JSON.stringify({ name: name })
        };
        fetch('pool/delete_pool', requestOptions)
        setPoolDeleted(true)
    }

    return (
        <div>
            <Link to={'MyPools/' + name}>Pool: {name}</Link>
            <p>Owner: {owner}</p>
            {username === owner? <a onClick={delete_pool}>Delete</a> : null}
        </div>
    )
}