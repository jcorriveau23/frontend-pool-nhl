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

import { db } from '../components/db/db';

const socket = io.connect('https://hockeypool.live', {
  path: '/mysocket',
});

export default function PoolPage({ user, DictUsers, injury, formatDate, date, setDate }) {
  const [poolInfo, setPoolInfo] = useState({});
  const [poolName] = useState(useParams().name); // get the name of the pool using the param url
  const [isUserParticipant, setIsUserParticipant] = useState(false);

  const find_last_date_in_db = pool => {
    if (!pool || !pool.context || !pool.context.score_by_day) {
      return null;
    }

    const tempDate = new Date();

    let i = 200; // Will look into the past 200 days to find the last date from now.

    do {
      const fTempDate = tempDate.toISOString().slice(0, 10);
      if (fTempDate in pool.context.score_by_day) {
        return fTempDate;
      }

      tempDate.setDate(tempDate.getDate() - 1);
      i -= 1;
    } while (i > 0);

    return null;
  };

  useEffect(async () => {
    if (user) {
      const pool = await db.pools.get({ name: poolName });
      const lastFormatDate = find_last_date_in_db(pool);

      // console.log(lastFormatDate);
      axios
        .get(lastFormatDate ? `/api-rust/pool/${poolName}/${lastFormatDate}` : `/api-rust/pool/${poolName}`, {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        })
        .then(res => {
          if (res.status === 200) {
            // [TODO] display a page or notification to show that the pool was not found
            if (lastFormatDate) {
              res.data.context.score_by_day = { ...pool.context.score_by_day, ...res.data.context.score_by_day }; // merge the new keys to the past saved pool.
            }

            if (pool) {
              res.data.id = pool.id;
            }

            setPoolInfo(res.data);
            db.pools.put(res.data, 'name');

            if (res.data.participants)
              setIsUserParticipant(res.data.participants.findIndex(participant => participant === user._id.$oid) > -1);
          }
        })
        .catch(e => {
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
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
            injury={injury}
            isUserParticipant={isUserParticipant}
            formatDate={formatDate}
            date={date}
            setDate={setDate}
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
