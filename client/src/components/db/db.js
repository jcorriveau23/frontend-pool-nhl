import Dexie from 'dexie';

export const db = new Dexie('hockeypool');
db.version(1).stores({
  pools: '++id, name', // Primary key and indexed props
});

db.version(1).stores({
  draft_players: '++id', // Primary key and indexed props
});
