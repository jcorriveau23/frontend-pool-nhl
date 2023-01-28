import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Components
import PoolOptions from './poolOptions';

export default function PoolSettings({ user, poolInfo, hasOwnerRights, setPoolUpdate }) {
  const [poolSettingsUpdate, setPoolSettingsUpdate] = useState(null);

  useEffect(() => {}, []);

  const update_settings = event => {
    if (event.target.type === 'select-one') {
      const updated_field = {};
      updated_field[event.target.name] = Number(event.target.value);

      setPoolSettingsUpdate(pool => ({ ...pool, ...updated_field }));
    }
  };

  const send_update = async () => {
    if (
      window.confirm(
        `Do you really want to update the following pool settings?\n${JSON.stringify(poolSettingsUpdate, undefined, 4)}`
      )
    ) {
      try {
        await axios.post(
          '/api-rust/update-pool-settings',
          {
            name: poolInfo.name,
            pool_settings: poolSettingsUpdate,
          },
          { headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` } }
        );

        setPoolUpdate(true);
        setPoolSettingsUpdate(null);
        alert('You have successfully update the pool setting!');
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  return (
    <>
      <PoolOptions
        poolInfo={poolInfo}
        poolSettingsUpdate={poolSettingsUpdate}
        hasOwnerRights={hasOwnerRights}
        update_settings={update_settings}
      />
      <button className="base-button" type="button" disabled={!poolSettingsUpdate} onClick={() => send_update()}>
        Send Modification
      </button>
    </>
  );
}
