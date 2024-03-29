import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// pool status components
import CreatedPool from '../components/pool_state/createdPool';
import DraftPool from '../components/pool_state/draftPool';
import InProgressPool from '../components/pool_state/inProgressPool';
import DynastiePool from '../components/pool_state/dynastiePool';

import { db } from '../components/db/db';

export default function PoolPage({
  user,
  DictUsers,
  setDictUsers,
  injury,
  formatDate,
  todayFormatDate,
  gameStatus,
  DictTeamAgainst,
}) {
  const [poolInfo, setPoolInfo] = useState(null);
  const [playersIdToPoolerMap, setPlayersIdToPoolerMap] = useState(null);
  const url = useParams(); // get the name of the pool using the param url
  const [poolName, setPoolName] = useState('');
  const [userIndex, setUserIndex] = useState(-2); // while still not processed, the value will be -2. That way we will know if the user is a pool participant.
  const [hasOwnerRights, setHasOwnerRights] = useState(false);
  const [poolUpdate, setPoolUpdate] = useState(false);

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

  const get_users = async participants => {
    try {
      const res = await axios.get(`/api-rust/users/${participants.join(',')}`);
      const DictUsersTmp = {};
      res.data.forEach(u => {
        DictUsersTmp[u._id] = u.name;
      });

      setDictUsers(DictUsersTmp);
    } catch (e) {
      console.log(e);
      alert(e);
    }
  };

  const fetch_pool_info = async forceUpdate => {
    const poolName_temp = url.name;
    if (poolName_temp !== poolName || forceUpdate) {
      setPoolInfo(null);
      setPoolName(poolName_temp);
      setPoolUpdate(false);

      const pool = await db.pools.get({ name: poolName_temp });
      const lastFormatDate = find_last_date_in_db(pool);

      let res;

      try {
        res = await axios.get(
          lastFormatDate
            ? `/api-rust/pool/${poolName_temp}/${pool.season_start}/${lastFormatDate}`
            : `/api-rust/pool/${poolName_temp}`
        );
      } catch (e) {
        alert(e.response.data);
        return;
      }

      if (pool) {
        if (res.data.date_updated !== pool.date_updated) {
          // In the case we want to force a complete pool update we check that field if an updated happened to request the complete pool information instead.

          try {
            res = await axios.get(`/api-rust/pool/${poolName_temp}`);
          } catch (e) {
            alert(e.response.data);
            return;
          }
        } else if (lastFormatDate) {
          // This is in the case we called the pool information for only a ranges of date since the rest of the date were already stored in the client database.

          res.data.context.score_by_day = { ...pool.context.score_by_day, ...res.data.context.score_by_day }; // merge the new keys to the past saved pool.
          // TODO hash the results and compare with server hash to determine if an update is needed
        }

        res.data.id = pool.id;
      }

      setPoolInfo(res.data);
      if (res.data.participants) {
        get_users(res.data.participants);
      } // Get the list of users that are in the pool.
      db.pools.put(res.data, 'name');

      if (res.data.participants) {
        setUserIndex(res.data.participants.findIndex(participant => participant === user?._id));
      } else {
        setUserIndex(-1);
      }
    }
  };

  useEffect(() => {
    fetch_pool_info(poolUpdate);
  }, [url, poolUpdate]);

  const process_pool_players_dict = async () => {
    const playersIdToPooler = {}; // 1st Player-ID -> Pooler-owner

    if (!poolInfo || !poolInfo.context || !poolInfo.context.pooler_roster) return;

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      // Forwards
      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_forwards.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_forwards[j];

        playersIdToPooler[playerId] = participant;
      }

      // Defenders
      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_defenders.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_defenders[j];

        playersIdToPooler[playerId] = participant;
      }

      // Goalies
      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_goalies.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_goalies[j];

        playersIdToPooler[playerId] = participant;
      }

      // Reservists
      for (let j = 0; j < poolInfo.context.pooler_roster[participant].chosen_reservists.length; j += 1) {
        const playerId = poolInfo.context.pooler_roster[participant].chosen_reservists[j];

        playersIdToPooler[playerId] = participant;
      }
    }

    setPlayersIdToPoolerMap(playersIdToPooler);
  };

  useEffect(() => {
    process_pool_players_dict();
    if (poolInfo) setHasOwnerRights(poolInfo.owner === user?._id || poolInfo.settings.assistants.includes(user?._id));
  }, [poolInfo]);

  if (poolInfo && userIndex >= -1) {
    switch (poolInfo.status) {
      case 'Created':
        return (
          <CreatedPool
            user={user}
            hasOwnerRights={hasOwnerRights}
            DictUsers={DictUsers}
            setDictUsers={setDictUsers}
            poolName={poolName}
            poolInfo={poolInfo}
            setPoolInfo={setPoolInfo}
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
            playersIdToPoolerMap={playersIdToPoolerMap}
            injury={injury}
            userIndex={userIndex}
          />
        );
      case 'InProgress':
      case 'Final':
        return (
          <InProgressPool
            user={user}
            hasOwnerRights={hasOwnerRights}
            DictUsers={DictUsers}
            poolInfo={poolInfo}
            playersIdToPoolerMap={playersIdToPoolerMap}
            injury={injury}
            userIndex={userIndex}
            formatDate={formatDate}
            todayFormatDate={todayFormatDate}
            gameStatus={gameStatus}
            setPoolUpdate={setPoolUpdate}
            DictTeamAgainst={DictTeamAgainst}
          />
        );
      case 'Dynastie':
        return (
          <DynastiePool
            user={user}
            DictUsers={DictUsers}
            poolInfo={poolInfo}
            playersIdToPoolerMap={playersIdToPoolerMap}
            setPoolUpdate={setPoolUpdate}
            injury={injury}
            userIndex={userIndex}
          />
        );
      default:
        return (
          <div className="cont">
            <h1>Not a valid pool status</h1>
          </div>
        );
    }
  }

  return (
    <div className="cont">
      <h1>Trying to fetch pool informations...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
