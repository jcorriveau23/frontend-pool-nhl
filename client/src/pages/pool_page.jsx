import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
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
      const cookie = Cookies.get(`token-${user.addr}`);

      // get pool info at start
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: cookie,
          poolname: poolName,
        },
      };
      fetch('https://hockeypool.live/api/pool/get_pool_info', requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.success === 'False') {
            // console.log(data)
            // [TODO] display a page or notification to show that the pool was not found
          } else {
            setPoolInfo(data.message);
          }
        });
    }
  }, [user]);

  if (user) {
    switch (poolInfo.status) {
      case 'created':
        return (
          <CreatedPool
            username={user.addr}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            socket={socket}
          />
        );
      case 'draft':
        return (
          <DraftPool
            username={user.addr}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            socket={socket}
          />
        );
      case 'in Progress':
        return <InProgressPool username={user.addr} poolName={poolName} poolInfo={poolInfo} />;
      case 'dynastie':
        return (
          <DynastiePool
            username={user.addr}
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
  user: PropTypes.shape({ addr: PropTypes.string.isRequired }),
};

PoolPage.defaultProps = {
  user: null,
};
