import React from 'react';
import Cookies from 'js-cookie';

export const PoolItem = ({
  name,
  owner,
  username,
  poolDeleted,
  setPoolDeleted,
}) => {
  const delete_pool = () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: Cookies.get('token-' + username),
      },
      body: JSON.stringify({ name: name }),
    };
    fetch('pool/delete_pool', requestOptions);
    setPoolDeleted(true);
  };

  return (
    <div>
      <p>Pool: {name}</p>
      <p>Owner: {owner}</p>
      {username === owner ? (
        <button onClick={delete_pool}>Delete</button>
      ) : null}
    </div>
  );
};
