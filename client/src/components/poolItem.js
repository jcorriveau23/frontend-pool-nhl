import React from 'react';
import Cookies from 'js-cookie';

function PoolItem({ name, owner, username, setPoolDeleted }) {
  const delete_pool = () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: Cookies.get(`token-${username}`),
      },
      body: JSON.stringify({ name }),
    };
    fetch('pool/delete_pool', requestOptions);
    setPoolDeleted(true);
  };

  return (
    <div>
      <p>Pool: {name}</p>
      <p>Owner: {owner}</p>
      {username === owner ? (
        <button onClick={delete_pool} type="button">
          Delete
        </button>
      ) : null}
    </div>
  );
}

export default PoolItem;
