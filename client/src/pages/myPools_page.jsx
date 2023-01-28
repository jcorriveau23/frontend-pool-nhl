import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// icons
import { IoMdAdd } from 'react-icons/io';
import { FaRunning, FaTools, FaHockeyPuck } from 'react-icons/fa';
import { BsFillPenFill } from 'react-icons/bs';

// css
import '../components/react-tabs.css';
import './page.css';

// components
import PoolItem from '../components/myPools_page/poolItem';

// modal
import CreatePoolModal from '../modals/createPool';

export default function MyPoolsPage({ user, DictUsers }) {
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [poolDeleted, setPoolDeleted] = useState(false);
  const [poolCreated, setPoolCreated] = useState([]);
  const [poolInProgress, setPoolInProgress] = useState([]);
  const [poolDraft, setPoolDraft] = useState([]);
  const [poolDynastie, setPoolDynastie] = useState([]);

  const get_pools = async () => {
    try {
      const res = await axios.get('/api-rust/pools', {
        headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
      });
      const pDraft = [];
      const pInProgress = [];
      const pDynastie = [];
      const pCreated = [];

      for (let i = 0; i < res.data.length; i += 1) {
        switch (res.data[i].status) {
          case 'Draft':
            pDraft.push({
              name: res.data[i].name,
              owner: res.data[i].owner,
            });
            break;
          case 'InProgress':
            pInProgress.push({
              name: res.data[i].name,
              owner: res.data[i].owner,
            });
            break;
          case 'Dynastie':
            pDynastie.push({
              name: res.data[i].name,
              owner: res.data[i].owner,
            });
            break;
          default:
            pCreated.push({
              name: res.data[i].name,
              owner: res.data[i].owner,
            });
            break;
        }
      }
      setPoolDraft(pDraft);
      setPoolInProgress(pInProgress);
      setPoolDynastie(pDynastie);
      setPoolCreated(pCreated);
    } catch (e) {
      alert(e.response.data);
    }
  };

  useEffect(() => {
    if (user && showCreatePoolModal === false) {
      get_pools();
    }
  }, [user, showCreatePoolModal, poolDeleted]); //  force to refetch data when creating/deleting a new pool.

  const openCreatePoolModal = () => {
    setShowCreatePoolModal(true);
  };

  if (user) {
    return (
      <div className="cont">
        <div>
          <h1>Pool list</h1>
          <button className="base-button" type="button" onClick={openCreatePoolModal} disabled={false}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <IoMdAdd size={30} />
                  </td>
                  <td>Create a new Pool</td>
                </tr>
              </tbody>
            </table>
          </button>
        </div>
        <div>
          <Tabs>
            <TabList>
              {poolInProgress.length > 0 ? (
                <Tab>
                  <FaRunning size={30} />
                  in Progress
                </Tab>
              ) : null}
              <Tab>
                <FaTools size={30} />
                Created
              </Tab>
              {poolDraft.length > 0 ? (
                <Tab>
                  <BsFillPenFill size={30} />
                  Drafting
                </Tab>
              ) : null}
              {poolDynastie.length > 0 ? (
                <Tab>
                  <FaHockeyPuck size={30} />
                  Dynastie
                </Tab>
              ) : null}
            </TabList>
            {poolInProgress.length > 0 ? (
              <TabPanel>
                <div className="pool_item">
                  <ul>
                    {poolInProgress.map(pool => (
                      <PoolItem key={pool.name} name={pool.name} owner={pool.owner} DictUsers={DictUsers} />
                    ))}
                  </ul>
                </div>
              </TabPanel>
            ) : null}
            <TabPanel>
              <div className="pool_item">
                <ul>
                  {poolCreated.map(pool => (
                    <PoolItem
                      key={pool.name}
                      name={pool.name}
                      owner={pool.owner}
                      user={user}
                      poolDeleted={poolDeleted}
                      setPoolDeleted={setPoolDeleted}
                      DictUsers={DictUsers}
                    />
                  ))}
                </ul>
              </div>
            </TabPanel>
            {poolDraft.length > 0 ? (
              <TabPanel>
                <div className="pool_item">
                  <ul>
                    {poolDraft.map(pool => (
                      <PoolItem key={pool.name} name={pool.name} owner={pool.owner} DictUsers={DictUsers} />
                    ))}
                  </ul>
                </div>
              </TabPanel>
            ) : null}
            {poolDynastie.length > 0 ? (
              <TabPanel>
                <div className="pool_item">
                  <ul>
                    {poolDynastie.map(pool => (
                      <PoolItem key={pool.name} name={pool.name} owner={pool.owner} DictUsers={DictUsers} />
                    ))}
                  </ul>
                </div>
              </TabPanel>
            ) : null}
          </Tabs>
          <CreatePoolModal
            showCreatePoolModal={showCreatePoolModal}
            setShowCreatePoolModal={setShowCreatePoolModal}
            user={user}
          />
        </div>
      </div>
    );
  }

  return <h1>You are not connected.</h1>;
}
