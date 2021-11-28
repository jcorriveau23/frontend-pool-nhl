import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useParams } from "react-router-dom";

// pool status components
import CreatedPool from '../components/pool_state/createdPool';
import DraftPool from '../components/pool_state/draftPool'
import InProgressPool from '../components/pool_state/inProgressPool';
import DynastiePool from '../components/pool_state/dynastiePool';

import io from "socket.io-client";

var socket = io.connect()

function PoolPage(username) {

    const [poolInfo, setPoolInfo] = useState({})
    const [poolName] = useState(useParams().name)   // get the name of the pool using the param url

    useEffect(() => {
        if (username) {
            var cookie = Cookies.get('token')

            // get pool info at start
            const requestOptions2 = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'token': cookie, 'pool_name': poolName}
            };
            fetch('../pool/get_pool_info', requestOptions2)
            .then(response => response.json())
            .then(data => {
                if(data.success === "False"){
                    //props.history.push('/pool_list');
                }
                else{
                    console.log(data.message)
                    setPoolInfo(data.message)
                }
            })
        }
    },[username]);
    
    if(poolInfo.status === "created")
    {
        return(
            <CreatedPool username={username} poolName={poolName} poolInfo={poolInfo} setPoolInfo={setPoolInfo} socket={socket}></CreatedPool>
        )
    }
    else if(poolInfo.status === "draft")
    {
        return(
            <DraftPool username={username} poolName={poolName} poolInfo={poolInfo} setPoolInfo={setPoolInfo} socket={socket}></DraftPool>
        )
    }
    else if(poolInfo.status === "in Progress")
    {
        return(
            <InProgressPool username={username} poolName={poolName} poolInfo={poolInfo}></InProgressPool>
        )
    }
    else if(poolInfo.status === "dynastie")
    {
        return(
            <DynastiePool username={username} poolName={poolName} poolInfo={poolInfo} setPoolInfo={setPoolInfo} socket={socket}></DynastiePool>
        )
    }
    else
    {
        return(
            <div>
                <h1>trying to fetch pool data info...</h1>
            </div>
        )
    }

    
  
  }
  export default PoolPage;