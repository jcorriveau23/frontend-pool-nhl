import React, { useEffect } from 'react';

// Icons
import { AiFillStar } from 'react-icons/ai';
import User from '../user';

export default function DrafterTurn({ nextDrafter, participant, user, DictUsers }) {
  useEffect(() => {}, [nextDrafter]);

  return (
    <>
      {nextDrafter === participant ? <AiFillStar color="green" size={30} /> : null}
      <User id={participant} user={user} DictUsers={DictUsers} />
    </>
  );
}
