import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { PoolItem } from "../components/poolItem";

import { CreatePoolModal } from '../modals/createPool';

function MyPools(username) {
    
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
                // [TODO] display a page or notification to tell the user that the pool list could not be fetch.
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
            <button onClick={openCreatePoolModal} disabled={false}>Create a new Pool.</button>

          <Tabs>
            <TabList>
              <Tab>Created</Tab>
              {poolDraft.length > 0? <Tab>Drafting</Tab> : null}
              {poolDynastie.length > 0? <Tab>Dynastie</Tab> : null}
              {poolInProgress.length > 0? <Tab>Progress</Tab> : null}
            </TabList>
            <TabPanel>
              {poolCreated.map((pool, i)  => 
                <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner} username={username} poolDeleted = {poolDeleted} setPoolDeleted={setPoolDeleted}></PoolItem></li>  
              )}
            </TabPanel>
            {poolDraft.length > 0?
              <TabPanel>
                {poolDraft.map((pool, i)  => 
                  <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li> 
                )}
              </TabPanel>
              : null
            }
            {poolDynastie.length > 0?
              <TabPanel>
                {poolDynastie.map((pool, i)  => 
                  <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li> 
                )}
              </TabPanel>
              : null
            }
            {poolInProgress.length > 0?
              <TabPanel>
                {poolInProgress.map((pool, i)  => 
                  <li class="pool_item"><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li> 
                )}
              </TabPanel>
              : null
            }
          </Tabs>
          <CreatePoolModal showCreatePoolModal={showCreatePoolModal} setShowCreatePoolModal={setShowCreatePoolModal} username={username}></CreatePoolModal>
      </div>
    );
    
  
  }
  export default MyPools;