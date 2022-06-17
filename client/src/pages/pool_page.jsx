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

const socket = io.connect('https://hockeypool.live', {
  path: '/mysocket',
});

export default function PoolPage({ user, DictUsers, injury }) {
  const [poolInfo, setPoolInfo] = useState({});
  const [poolName] = useState(useParams().name); // get the name of the pool using the param url
  const [isUserParticipant, setIsUserParticipant] = useState(false);

  useEffect(() => {
    if (user) {
      axios
        .get(`/api-rust/pool/${poolName}`, {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        })
        .then(res => {
          if (res.status === 200) {
            // [TODO] display a page or notification to show that the pool was not found
            setPoolInfo(res.data);

            setIsUserParticipant(res.data.participants.findIndex(participant => participant === user._id.$oid) > -1);
          }
        })
        .catch(e => {
          setPoolInfo(null);
          console.log(e.response);
        });
    }
  }, [user]);

  if (user && poolInfo) {
    switch (poolInfo.status) {
      case 'Created':
        return (
          <CreatedPool
            user={user}
            DictUsers={DictUsers}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            socket={socket}
          />
        );
      case 'Draft':
        return (
          <DraftPool
            user={user}
            DictUsers={DictUsers}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            injury={injury}
            socket={socket}
            isUserParticipant={isUserParticipant}
          />
        );
      case 'InProgress':
        return (
          <InProgressPool
            user={user}
            DictUsers={DictUsers}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            injury={injury}
            isUserParticipant={isUserParticipant}
          />
        );
      case 'Dynastie':
        return (
          <DynastiePool
            user={user}
            DictUsers={DictUsers}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            injury={injury}
            socket={socket}
            isUserParticipant={isUserParticipant}
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
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }),
  DictUsers: PropTypes.shape({}).isRequired,
};

PoolPage.defaultProps = {
  user: null,
};
