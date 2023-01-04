import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ReactTooltip from 'react-tooltip';

// icons
import { GiEntryDoor, GiExitDoor } from 'react-icons/gi';
import { BsCalendarDay } from 'react-icons/bs';
import { AiFillCheckCircle } from 'react-icons/ai';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import { RiInformationFill } from 'react-icons/ri';

// Components
import User from '../user';
import PlayerLink from '../playerLink';
import { logos } from '../img/logos';
import TradeItem from './tradeItem';
import TradeCenter from './tradeCenter';

export default function PoolHistory({
  poolInfo,
  todayFormatDate,
  playerIdToPlayersDataMap,
  setPoolUpdate,
  hasOwnerRights,
  injury,
  user,
  DictUsers,
  userIndex,
}) {
  const [history, setHistory] = useState(null);
  const [doneProcessing, setDoneProcessing] = useState(false);
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
      const dailyTrades = poolInfo.trades?.filter(
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

    if (historyTmp.length > 0) {
      setHistory(historyTmp);
      setCollapsedDays(historyTmp.map(d => (d.date !== historyTmp[0].date ? d.date : null))); // collapse every day except the last
    }

    setDoneProcessing(true);
  };

  useEffect(() => {
    parse_all_movement();
  }, []);

  const collapse_day = date => {
    if (collapsedDays.includes(date)) {
      // remove the date to the list of collapsed table
      setCollapsedDays(collapsedDays.filter(day => day !== date));
    } else {
      // add the date to the list of collapsed table
      setCollapsedDays(oldArr => [...oldArr, date]);
    }
  };

  const collapse_all_days = () => {
    setCollapsedDays(history.map(dailyMovements => dailyMovements.date));
  };

  const expand_all_days = () => {
    setCollapsedDays([]);
  };

  const render_daily_roster_movement = dailyMovements => (
    <>
      <tr onClick={() => collapse_day(dailyMovements.date)}>
        <th>
          <div style={{ float: 'left' }}>
            <BsCalendarDay size={30} style={{ paddingRight: '10px' }} />
            {dailyMovements.date}
            {poolInfo.roster_modification_date.includes(dailyMovements.date) ||
            (poolInfo.roster_modification_date.includes(todayFormatDate) && dailyMovements.date === 'Today') ? (
              <>
                <a data-tip={`roster modifications were allowed on this day!`}>
                  <RiInformationFill size={40} color="yellow" style={{ paddingLeft: '10px' }} />
                </a>
                <ReactTooltip className="tooltip" />
              </>
            ) : null}
          </div>
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

  const render_processing = () =>
    doneProcessing ? (
      <div className="cont">
        <h1>There is no history or trade to keep track of yet!</h1>
      </div>
    ) : (
      <div className="cont">
        <h1>Processing history...</h1>
        <ClipLoader color="#fff" loading size={75} />
      </div>
    );

  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Trade Center</Tab>
          <Tab>History</Tab>
        </TabList>
        <TabPanel>
          <TradeCenter
            poolInfo={poolInfo}
            setPoolUpdate={setPoolUpdate}
            playerIdToPlayersDataMap={playerIdToPlayersDataMap}
            injury={injury}
            user={user}
            hasOwnerRights={hasOwnerRights}
            DictUsers={DictUsers}
            userIndex={userIndex}
          />
        </TabPanel>
        <TabPanel>
          {history ? (
            <>
              <button
                className="base-button"
                type="button"
                onClick={() => expand_all_days()}
                disabled={collapsedDays.length === 0}
              >
                Expand all
              </button>
              <button
                className="base-button"
                type="button"
                onClick={() => collapse_all_days()}
                disabled={collapsedDays.length === history.length}
              >
                Collapse all
              </button>
              <table className="content-table">
                <tbody>{history.map(dailyMovements => render_daily_roster_movement(dailyMovements))}</tbody>
              </table>
            </>
          ) : (
            render_processing()
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
