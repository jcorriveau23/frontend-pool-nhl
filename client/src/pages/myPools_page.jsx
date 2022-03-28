import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import PropTypes from 'prop-types';

// css
import '../components/react-tabs.css';

// components
import PoolItem from '../components/poolItem';

// modal
import CreatePoolModal from '../modals/createPool';

export default function MyPoolsPage({ user }) {
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [poolDeleted, setPoolDeleted] = useState(false);
  const [poolCreated, setPoolCreated] = useState([]);
  const [poolInProgress, setPoolInProgress] = useState([]);
  const [poolDraft, setPoolDraft] = useState([]);
  const [poolDynastie, setPoolDynastie] = useState([]);

  useEffect(() => {
    if (user && showCreatePoolModal === false) {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: Cookies.get(`token-${user.addr}`),
        },
      };
      fetch('https://hockeypool.live/api/pool/pool_list', requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.success === 'False') {
            // [TODO] display a page or notification to tell the user that the pool list could not be fetch.
            // console.log(data.message);
          } else {
            const pDraft = [];
            const pInProgress = [];
            const pDynastie = [];

            for (let i = 0; i < data.user_pools_info.length; i += 1) {
              switch (data.user_pools_info[i].status) {
                case 'draft':
                  pDraft.push({
                    name: data.user_pools_info[i].name,
                    owner: data.user_pools_info[i].owner,
                  });
                  break;
                case 'in Progress':
                  pInProgress.push({
                    name: data.user_pools_info[i].name,
                    owner: data.user_pools_info[i].owner,
                  });
                  break;
                case 'dynastie':
                  pDynastie.push({
                    name: data.user_pools_info[i].name,
                    owner: data.user_pools_info[i].owner,
                  });
                  break;
                default:
                  break;
              }
            }
            setPoolCreated(data.pool_created);
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
          <button type="button" onClick={openCreatePoolModal} disabled={false}>
            Create a new Pool.
          </button>
        </div>
        <div>
          <Tabs>
            <TabList>
              <Tab>Created</Tab>
              {poolDraft.length > 0 ? <Tab>Drafting</Tab> : null}
              {poolDynastie.length > 0 ? <Tab>Dynastie</Tab> : null}
              {poolInProgress.length > 0 ? <Tab>in Progress</Tab> : null}
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
                          username={user.addr}
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
                          <PoolItem name={pool.name} owner={pool.owner} />
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
                          <PoolItem name={pool.name} owner={pool.owner} />
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
                          <PoolItem name={pool.name} owner={pool.owner} />
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
            username={user.addr}
          />
        </div>
      </div>
    );
  }

  return <h1>You are not connected.</h1>;
}

MyPoolsPage.propTypes = {
  user: PropTypes.shape({ addr: PropTypes.string.isRequired }),
};

MyPoolsPage.defaultProps = {
  user: null,
};
