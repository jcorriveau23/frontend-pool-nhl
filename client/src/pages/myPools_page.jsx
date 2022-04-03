import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PropTypes from 'prop-types';

// icons
import { IoMdAdd } from 'react-icons/io';
import { FaRunning, FaTools, FaHockeyPuck } from 'react-icons/fa';
import { BsFillPenFill } from 'react-icons/bs';

// css
import '../components/react-tabs.css';
import './page.css';

// components
import PoolItem from '../components/poolItem';

// modal
import CreatePoolModal from '../modals/createPool';

export default function MyPoolsPage({ user, DictUsers }) {
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [poolDeleted, setPoolDeleted] = useState(false);
  const [poolCreated, setPoolCreated] = useState([]);
  const [poolInProgress, setPoolInProgress] = useState([]);
  const [poolDraft, setPoolDraft] = useState([]);
  const [poolDynastie, setPoolDynastie] = useState([]);

  useEffect(() => {
    if (user && showCreatePoolModal === false) {
      axios
        .get('/api/pool/pool_list', {
          headers: {
            token: Cookies.get(`token-${user._id}`),
          },
        })
        .then(res => {
          if (res.data.success === false) {
            // [TODO] display a page or notification to tell the user that the pool list could not be fetch.
            // console.log(data.message);
          } else {
            const pDraft = [];
            const pInProgress = [];
            const pDynastie = [];

            for (let i = 0; i < res.data.user_pools_info.length; i += 1) {
              switch (res.data.user_pools_info[i].status) {
                case 'draft':
                  pDraft.push({
                    name: res.data.user_pools_info[i].name,
                    owner: res.data.user_pools_info[i].owner,
                  });
                  break;
                case 'in Progress':
                  pInProgress.push({
                    name: res.data.user_pools_info[i].name,
                    owner: res.data.user_pools_info[i].owner,
                  });
                  break;
                case 'dynastie':
                  pDynastie.push({
                    name: res.data.user_pools_info[i].name,
                    owner: res.data.user_pools_info[i].owner,
                  });
                  break;
                default:
                  break;
              }
            }
            setPoolCreated(res.data.pool_created);
            setPoolDraft(pDraft);
            setPoolInProgress(pInProgress);
            setPoolDynastie(pDynastie);
          }
          setPoolDeleted(false);
        });
    }
  }, [user, showCreatePoolModal, poolDeleted]); // showCreatePoolModal force to refetch data when creating a new pool.

  const openCreatePoolModal = () => {
    setShowCreatePoolModal(true);
  };

  if (user) {
    return (
      <div>
        <div>
          <h1>Pool list</h1>
          <button className="base_button" type="button" onClick={openCreatePoolModal} disabled={false}>
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
              {poolInProgress.length > 0 ? (
                <Tab>
                  <FaRunning size={30} />
                  in Progress
                </Tab>
              ) : null}
            </TabList>
            <TabPanel>
              <div className="pool_item">
                <ul>
                  {poolCreated.map(pool => (
                    <Link to={`/my-pools/${pool.name}`} key={pool.name}>
                      <li>
                        <PoolItem
                          name={pool.name}
                          owner={pool.owner}
                          user={user}
                          DictUsers={DictUsers}
                          poolDeleted={poolDeleted}
                          setPoolDeleted={setPoolDeleted}
                        />
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            </TabPanel>
            {poolDraft.length > 0 ? (
              <TabPanel>
                <div className="pool_item">
                  <ul>
                    {poolDraft.map(pool => (
                      <Link to={`/my-pools/${pool.name}`} key={pool.name}>
                        <li>
                          <PoolItem name={pool.name} owner={pool.owner} DictUsers={DictUsers} />
                        </li>
                      </Link>
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
                      <Link to={`/my-pools/${pool.name}`} key={pool.name}>
                        <li>
                          <PoolItem name={pool.name} owner={pool.owner} DictUsers={DictUsers} />
                        </li>
                      </Link>
                    ))}
                  </ul>
                </div>
              </TabPanel>
            ) : null}
            {poolInProgress.length > 0 ? (
              <TabPanel>
                <div className="pool_item">
                  <ul>
                    {poolInProgress.map(pool => (
                      <Link to={`/my-pools/${pool.name}`} key={pool.name}>
                        <li>
                          <PoolItem name={pool.name} owner={pool.owner} DictUsers={DictUsers} />
                        </li>
                      </Link>
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

MyPoolsPage.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }),
};

MyPoolsPage.defaultProps = {
  user: null,
};
