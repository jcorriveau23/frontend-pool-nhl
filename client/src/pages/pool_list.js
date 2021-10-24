import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { PoolItem } from "../components/poolItem";

import { CreatePoolModal } from '../modals/createPool';

function PoolList(username) {
    
    const [showCreatePoolModal, setShowCreatePoolModal] = useState(false)
    const [poolDeleted, setPoolDeleted] = useState(false)
    const [poolCreated, setPoolCreated] = useState([])
    const [poolInProgress, setPoolInProgress] = useState([])
    const [poolDraft, setPoolDraft] = useState([])
    const [poolDynastie, setPoolDynastie] = useState([])

    useEffect(() => {
      if (username && showCreatePoolModal === false) {
        const requestOptions = {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')}
            };
            fetch('pool/pool_list', requestOptions)
            .then(response => response.json())
            .then(data => {
              if(data.success === "False"){
                console.log(data.message)
              }
              else{
                
                var poolDraft = []
                var poolInProfress = []
                var poolDynastie = []
      
                for(var i=0; i < data.user_pools_info.length; i++){
                  if (data.user_pools_info[i]['status'] === 'draft'){
                    poolDraft.push({name: data.user_pools_info[i]['name'], owner: data.user_pools_info[i]['owner']})
                  }
                  else if (data.user_pools_info[i]['status'] === 'in Progress'){
                    poolInProfress.push({name: data.user_pools_info[i]['name'], owner: data.user_pools_info[i]['owner']})
                  }
                  else if (data.user_pools_info[i]['status'] === 'dynastie'){
                    poolDynastie.push({name: data.user_pools_info[i]['name'], owner: data.user_pools_info[i]['owner']})
                  } 
                }
                setPoolCreated(data.pool_created)
                setPoolDraft(poolDraft)
                setPoolInProgress(poolInProfress)
                setPoolDynastie(poolDynastie)
              }
              setPoolDeleted(false)
            })
      }
    }, [username, showCreatePoolModal, poolDeleted]); // showCreatePoolModal force to refetch data when creating a new pool.

    const openCreatePoolModal = () => {
      setShowCreatePoolModal(true)
    }

    return(
      <div>
          <h1>Pool list</h1>
          <button onClick={openCreatePoolModal}>Create a new Pool.</button>
          <h2>Created</h2>
          {poolCreated.map(pool => 
          <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner} username={username} poolDeleted = {poolDeleted} setPoolDeleted={setPoolDeleted}></PoolItem></li>  
          )}
          <h2>Drafting</h2>
          {poolDraft.map(pool => 
          <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li> 
          )}
          <h2>Dynastie</h2>
          {poolDynastie.map(pool => 
          <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li> 
          )}
          <h2>in Progress</h2>
          {poolInProgress.map(pool => 
          <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li> 
          )}
          <CreatePoolModal showCreatePoolModal={showCreatePoolModal} setShowCreatePoolModal={setShowCreatePoolModal} username={username}></CreatePoolModal>
      </div>
    );
    
  
  }
  export default PoolList;