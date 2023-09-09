import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// icons
import { IoMdAdd } from 'react-icons/io';
import { FaRunning, FaTools, FaHockeyPuck } from 'react-icons/fa';
import { BsFillPenFill } from 'react-icons/bs';
import { RiInformationFill } from 'react-icons/ri';

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
  const [poolFinal, setPoolFinal] = useState([]);

  const get_pools = async () => {
    try {
      const res = await axios.get('/api-rust/pools');
      const pDraft = [];
      const pInProgress = [];
      const pDynastie = [];
      const pFinal = [];
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
          case 'Final':
            pFinal.push({
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
      setPoolFinal(pFinal);
    } catch (e) {
      alert(e.response.data);
    }
  };

  useEffect(() => {
    if (showCreatePoolModal === false) {
      get_pools();
    }
  }, [showCreatePoolModal, poolDeleted]); //  force to refetch data when creating/deleting a new pool.

  const openCreatePoolModal = () => {
    setShowCreatePoolModal(true);
  };

  return (
    <div className="cont">
      <div>
        <h1>Pool list</h1>
        <table>
          <tbody>
            <td>
              <button className="base-button" type="button" onClick={openCreatePoolModal}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <IoMdAdd size={45} />
                      </td>
                      <td>Create a new Pool</td>
                      <td>
                        <ReactTooltip className="tooltip" padding="8px" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </button>
            </td>
          </tbody>
        </table>
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
            {poolCreated.length > 0 ? (
              <Tab>
                <FaTools size={30} />
                Created
              </Tab>
            ) : null}
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
            {poolFinal.length > 0 ? (
              <Tab>
                <FaHockeyPuck size={30} />
                Final
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
          {poolCreated.length > 0 ? (
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
          ) : null}
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
          {poolFinal.length > 0 ? (
            <TabPanel>
              <div className="pool_item">
                <ul>
                  {poolFinal.map(pool => (
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
