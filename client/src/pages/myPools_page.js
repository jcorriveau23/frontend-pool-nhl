import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom"

import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import '../components/react-tabs.css';

import { PoolItem } from "../components/poolItem";

import { CreatePoolModal } from '../modals/createPool';

function MyPoolsPage(user) {
    
    const [showCreatePoolModal, setShowCreatePoolModal] = useState(false)
    const [poolDeleted, setPoolDeleted] = useState(false)
    const [poolCreated, setPoolCreated] = useState([])
    const [poolInProgress, setPoolInProgress] = useState([])
    const [poolDraft, setPoolDraft] = useState([])
    const [poolDynastie, setPoolDynastie] = useState([])

    useEffect(() => {
      if (user && showCreatePoolModal === false) {
        const requestOptions = {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token-' + user.addr)}
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
    }, [user, showCreatePoolModal, poolDeleted]); // showCreatePoolModal force to refetch data when creating a new pool.

    const openCreatePoolModal = () => {
      setShowCreatePoolModal(true)
    }

    if(user){
      return(
        <div>
          <div>
            <h1>Pool list</h1>
            <button onClick={openCreatePoolModal} disabled={false}>Create a new Pool.</button>
          </div>
          <div>
            <Tabs>
              <TabList>
                <Tab>Created</Tab>
                {poolDraft.length > 0? <Tab>Drafting</Tab> : null}
                {poolDynastie.length > 0? <Tab>Dynastie</Tab> : null}
                {poolInProgress.length > 0? <Tab>in Progress</Tab> : null}
              </TabList>
              <TabPanel >
                <div className="pool_item">
                  <ul>
                    {poolCreated.map((pool, i)  => 
                      <Link to={'MyPools/' + pool.name} key={i}><li><PoolItem name={pool.name} owner={pool.owner} username={user.addr} poolDeleted = {poolDeleted} setPoolDeleted={setPoolDeleted}></PoolItem></li></Link>  
                    )}
                  </ul>
                </div>
              </TabPanel>
              {poolDraft.length > 0?
                <TabPanel>
                  <div className="pool_item">
                    <ul>
                      {poolDraft.map((pool, i)  => 
                        <Link to={'MyPools/' + pool.name} key={i}><li><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li></Link>
                      )}
                    </ul>
                  </div>
                </TabPanel>
                : null
              }
              {poolDynastie.length > 0?
                <TabPanel>
                  <div className="pool_item">
                    <ul>
                      {poolDynastie.map((pool, i)  => 
                        <Link to={'MyPools/' + pool.name} key={i}><li><PoolItem name={pool.name} owner={pool.owner}></PoolItem></li></Link> 
                      )}
                    </ul>
                  </div>
                </TabPanel>
                : null
              }
              {poolInProgress.length > 0?
                <TabPanel>
                  <div className="pool_item">
                    <ul>
                      {poolInProgress.map((pool, i)  => 
                        <Link to={'MyPools/' + pool.name} key={i}><li><PoolItem name={pool.name} owner={pool.owner} key={i}></PoolItem></li></Link> 
                      )}
                    </ul>
                  </div>
                </TabPanel>
                : null
              }
            </Tabs>
            <CreatePoolModal showCreatePoolModal={showCreatePoolModal} setShowCreatePoolModal={setShowCreatePoolModal} username={user.addr}></CreatePoolModal>
          </div>
        </div>
      );
    }
    else
      return(<h1>You are not connected.</h1>);
   
    
  
  }
  export default MyPoolsPage;