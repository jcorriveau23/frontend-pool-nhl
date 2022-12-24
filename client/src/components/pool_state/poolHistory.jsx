import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// icons
import { GiEntryDoor, GiExitDoor } from 'react-icons/gi';
import { BsCalendarDay } from 'react-icons/bs';
import { AiFillCheckCircle } from 'react-icons/ai';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

// Components
import User from '../user';
import PlayerLink from '../playerLink';
import { logos } from '../img/logos';
import TradeItem from './tradeItem';
import TradeCenter from './tradeCenter';

export default function PoolHistory({
  poolInfo,
  playerIdToPlayersDataMap,
  setPoolUpdate,
  hasOwnerRights,
  injury,
  user,
  DictUsers,
  isUserParticipant,
}) {
  const [history, setHistory] = useState(null);
  const [collapsedDays, setCollapsedDays] = useState([]);

  const parse_all_movement = async () => {
    const startDate = new Date(poolInfo.season_start);

    const endDate = new Date();

    const currentRoster = {};
    const historyTmp = [];
    let isFirstDay = true;

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);

      const dailyMovements = []; // Will capture all movement that happened on this date.
      const dailyTrades = poolInfo.trades.filter(
        trade =>
          trade.status === 'ACCEPTED' && new Date(trade.date_accepted + 3600000).toISOString().slice(0, 10) === jDate
      );

      if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[jDate]) {
        for (let i = 0; i < poolInfo.participants.length; i += 1) {
          const participant = poolInfo.participants[i];
          const forwards = Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.F);
          const defenders = Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.D);
          const goalies = Object.keys(poolInfo.context.score_by_day[jDate][participant].roster.G);

          const roster = forwards.concat(defenders, goalies);

          if (!isFirstDay) {
            // see if a changes was made to the roster and note it in historyTmp.

            const removedPlayers = currentRoster[participant].filter(player => !roster.includes(player));
            const addedPlayers = roster.filter(player => !currentRoster[participant].includes(player));

            if (removedPlayers.length > 0 || addedPlayers.length > 0) {
              const movement = {
                participant,
                removedPlayers,
                addedPlayers,
              };
              dailyMovements.push(movement);
            }
          }

          // update the current roster.
          currentRoster[participant] = roster;
        }

        if (dailyMovements.length > 0 || dailyTrades.length > 0) {
          historyTmp.unshift({ date: jDate, dailyMovements, dailyTrades });
        }

        if (isFirstDay) isFirstDay = false; // We will start to note changes applied to rosters after the first day.
      }
    }

    // Make sure that we count current roster (for days that roster modifications are allowed we will see them in real time)
    // TODO: this could be generalize by creating a function centralizing logic between this and the for loop above.

    const dailyMovements = []; // Will capture all movement that happened on this date.
    const dailyTrades = poolInfo.trades.filter(trade => trade.status === 'NEW');
    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      const forwards = poolInfo.context.pooler_roster[participant].chosen_forwards.map(player => player.id);
      const defenders = poolInfo.context.pooler_roster[participant].chosen_defenders.map(player => player.id);
      const goalies = poolInfo.context.pooler_roster[participant].chosen_goalies.map(player => player.id);

      const roster = forwards.concat(defenders, goalies);

      // see if a changes was made to the roster and note it in historyTmp.

      const removedPlayers = currentRoster[participant].filter(player => !roster.includes(Number(player)));
      const addedPlayers = roster.filter(player => !currentRoster[participant].includes(String(player)));

      if (removedPlayers.length > 0 || addedPlayers.length > 0) {
        const movement = {
          participant,
          removedPlayers,
          addedPlayers,
        };
        dailyMovements.push(movement);
      }
    }

    if (dailyMovements.length > 0 || dailyTrades.length > 0) {
      historyTmp.unshift({ date: 'Today', dailyMovements, dailyTrades });
    }

    console.log(historyTmp);
    if (historyTmp.length > 0) setHistory(historyTmp);
  };

  useEffect(() => {
    parse_all_movement();
  }, []);

  const collapse_table = date => {
    if (collapsedDays.includes(date)) {
      // add the date to the list of collapsed table
      setCollapsedDays(collapsedDays.filter(day => day !== date));
    } else {
      // remove the date to the list of collapsed table
      setCollapsedDays(oldArr => [...oldArr, date]);
    }
  };

  const render_daily_roster_movement = dailyMovements => (
    <>
      <tr onClick={() => collapse_table(dailyMovements.date)}>
        <th>
          <BsCalendarDay size={30} style={{ paddingRight: '10px' }} />
          {dailyMovements.date}
          {collapsedDays.includes(dailyMovements.date) ? (
            <MdExpandMore size={30} style={{ float: 'right' }} />
          ) : (
            <MdExpandLess size={30} style={{ float: 'right' }} />
          )}
        </th>
      </tr>
      {collapsedDays.includes(dailyMovements.date) ? null : (
        <tr>
          <td>
            <table className="content-table-no-hover">
              {dailyMovements.dailyMovements.map(d => (
                <>
                  <tr>
                    <th colSpan={3}>
                      <User id={d.participant} user={user} DictUsers={DictUsers} />
                    </th>
                  </tr>
                  {d.addedPlayers.map(p => (
                    <tr>
                      <td>
                        <PlayerLink name={playerIdToPlayersDataMap[p].name} id={p} />
                      </td>
                      <td>
                        <img src={logos[playerIdToPlayersDataMap[p].team]} alt="" width="50" height="50" />
                      </td>
                      <td>
                        <GiEntryDoor color="green" size={30} />
                      </td>
                    </tr>
                  ))}
                  {d.removedPlayers.map(p => (
                    <tr>
                      <td>
                        <PlayerLink name={playerIdToPlayersDataMap[p].name} id={p} />
                      </td>
                      <td>
                        <img src={logos[playerIdToPlayersDataMap[p].team]} alt="" width="50" height="50" />
                      </td>
                      <td>
                        <GiExitDoor color="red" size={30} />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
              {dailyMovements.dailyTrades.length > 0 ? (
                <tr>
                  <td colSpan={3}>
                    {dailyMovements.dailyTrades
                      .slice(0)
                      .reverse()
                      .map(tradeInfo => (
                        <table className="content-table-no-hover">
                          <tbody>
                            <tr>
                              <th width="75px">
                                <AiFillCheckCircle size={50} color="green" />
                              </th>
                              <th>
                                <TradeItem
                                  tradeInfo={tradeInfo}
                                  playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                                  DictUsers={DictUsers}
                                />
                              </th>
                            </tr>
                          </tbody>
                        </table>
                      ))}
                  </td>
                </tr>
              ) : null}
            </table>
          </td>
        </tr>
      )}
    </>
  );

  if (history) {
    return (
      <div>
        <Tabs>
          <TabList>
            <Tab>History</Tab>
            <Tab>Trade Center</Tab>
          </TabList>
          <TabPanel>
            <table className="content-table">
              <tbody>{history.map(dailyMovements => render_daily_roster_movement(dailyMovements))}</tbody>
            </table>
          </TabPanel>
          <TabPanel>
            <TradeCenter
              poolInfo={poolInfo}
              setPoolUpdate={setPoolUpdate}
              playerIdToPlayersDataMap={playerIdToPlayersDataMap}
              injury={injury}
              user={user}
              hasOwnerRights={hasOwnerRights}
              DictUsers={DictUsers}
              isUserParticipant={isUserParticipant}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="cont">
      <h1>Processing history...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
