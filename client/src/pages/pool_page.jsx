import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// pool status components
import CreatedPool from '../components/pool_state/createdPool';
import DraftPool from '../components/pool_state/draftPool';
import InProgressPool from '../components/pool_state/inProgressPool';
import DynastiePool from '../components/pool_state/dynastiePool';

const socket = io('http://localhost:8080');

export default function PoolPage({ user }) {
  const [poolInfo, setPoolInfo] = useState({});
  const [poolName] = useState(useParams().name); // get the name of the pool using the param url

  useEffect(() => {
    if (user) {
      axios
        .get('https://hockeypool.live/api/pool/get_pool_info', {
          headers: {
            token: Cookies.get(`token-${user.name}`),
            poolname: poolName,
          },
        })
        .then(res => {
          if (res.data.success === 'True') {
            // [TODO] display a page or notification to show that the pool was not found
            setPoolInfo(res.data.message);
          }
        });
    }
  }, [user]);

  if (user) {
    switch (poolInfo.status) {
      case 'created':
        return (
          <CreatedPool
            username={user.name}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            socket={socket}
          />
        );
      case 'draft':
        return (
          <DraftPool
            username={user.name}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            socket={socket}
          />
        );
      case 'in Progress':
        return <InProgressPool username={user.name} poolName={poolName} poolInfo={poolInfo} />;
      case 'dynastie':
        return (
          <DynastiePool
            username={user.name}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            socket={socket}
          />
        );
      default:
        return (
          <div>
            <h1>Trying to fetch pool data info...</h1>
            <ClipLoader color="#fff" loading size={75} />
          </div>
        );
    }
  }
  return <h1>You are not connected.</h1>;
}

PoolPage.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string.isRequired }),
};

PoolPage.defaultProps = {
  user: null,
};
