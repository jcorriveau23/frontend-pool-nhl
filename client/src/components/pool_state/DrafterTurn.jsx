import React, { useEffect } from 'react';
import { Tab } from 'react-tabs';

// Icons
import { AiFillStar } from 'react-icons/ai';
import User from '../user';

export default function DrafterTurn({ nextDrafter, participant, user, DictUsers }) {
  useEffect(() => {}, [nextDrafter]);

  if (nextDrafter === participant) {
    return (
      <Tab key={participant} style={{ color: 'green' }}>
        <AiFillStar size={30} />
        <User id={participant} user={user} DictUsers={DictUsers} />
      </Tab>
    );
  }

  return (
    <Tab key={participant}>
      <User id={participant} user={user} DictUsers={DictUsers} />
    </Tab>
  );
}
