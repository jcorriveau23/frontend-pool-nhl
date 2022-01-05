import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useParams } from "react-router-dom";

// pool status components
import CreatedPool from '../components/pool_state/createdPool';
import DraftPool from '../components/pool_state/draftPool'
import InProgressPool from '../components/pool_state/inProgressPool';
import DynastiePool from '../components/pool_state/dynastiePool';

import io from "socket.io-client";

// Loader
import ClipLoader from "react-spinners/ClipLoader"

var socket = io.connect()

function PoolPage(user) {

    const [poolInfo, setPoolInfo] = useState({})
    const [poolName] = useState(useParams().name)   // get the name of the pool using the param url

    useEffect(() => {
        if (user) {
            var cookie = Cookies.get('token-' + user.addr)

            // get pool info at start
            const requestOptions2 = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'token': cookie, 'poolname': poolName}
            };
            fetch('../pool/get_pool_info', requestOptions2)
            .then(response => response.json())
            .then(data => {
                if(data.success === "False"){
                    console.log(data)
                    // [TODO] display a page or notification to show that the pool was not found
                }
                else{
                    console.log(data)
                    setPoolInfo(data.message)
                }
            })
        }
    },[user]); // eslint-disable-line react-hooks/exhaustive-deps
    
    if(user){
        if(poolInfo.status === "created")
        {
            return(
                <CreatedPool username={user.addr} poolName={poolName} poolInfo={poolInfo} setPoolInfo={setPoolInfo} socket={socket}></CreatedPool>
            )
        }
        else if(poolInfo.status === "draft")
        {
            return(
                <DraftPool username={user.addr} poolName={poolName} poolInfo={poolInfo} setPoolInfo={setPoolInfo} socket={socket}></DraftPool>
            )
        }
        else if(poolInfo.status === "in Progress")
        {
            return(
                <InProgressPool username={user.addr} poolName={poolName} poolInfo={poolInfo}></InProgressPool>
            )
        }
        else if(poolInfo.status === "dynastie")
        {
            return(
                <DynastiePool username={user.addr} poolName={poolName} poolInfo={poolInfo} setPoolInfo={setPoolInfo} socket={socket}></DynastiePool>
            )
        }
        else
        {
            return(
                <div>
                    <h1>Trying to fetch pool data info...</h1>
                    <ClipLoader color="#fff" loading={true} size={75}/>
                </div>
            )
        }
    }
    else
        return(<h1>You are not connected.</h1>);
   

    
  
  }
  export default PoolPage;