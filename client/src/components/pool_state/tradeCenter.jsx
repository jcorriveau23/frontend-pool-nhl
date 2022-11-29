import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { AiFillCheckCircle } from 'react-icons/ai';

// components
import TradeItem from './tradeItem';

// modal
import CreateTradeModal from '../../modals/createTrade';

export default function TradeCenter({
  poolInfo,
  setPoolUpdate,
  playerIdToPlayersDataMap,
  injury,
  user,
  DictUsers,
  isUserParticipant,
}) {
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);

  const respond_trade = (tradeID, isAccepted) => {
    if (
      window.confirm(`Do you really want to accept the trade? Players and picks will be transfered on this action.`)
    ) {
      axios
        .post(
          '/api-rust/respond-trade',
          { trade_id: tradeID, name: poolInfo.name, is_accepted: isAccepted },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
          }
        )
        .then(res => {
          if (res.data.success) {
            setPoolUpdate(true);
          } else {
            alert(res.data.message);
          }
        });
    }
  };
  const cancel_trade = tradeID => {
    if (window.confirm(`Do you really want to cancel the trade?`)) {
      axios
        .post(
          '/api-rust/cancel-trade',
          { trade_id: tradeID, name: poolInfo.name },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
          }
        )
        .then(res => {
          if (res.data.success) {
            setPoolUpdate(true);
          } else {
            alert(res.data.message);
          }
        });
    }
  };

  if (poolInfo.trades) {
    return (
      <div className="half-cont">
        <Tabs>
          <TabList>
            <Tab>Trades</Tab>
            <Tab>Refused Trades</Tab>
            <Tab>Cancelled Trades</Tab>
          </TabList>
          {isUserParticipant ? (
            <>
              <button className="base-button" type="button" onClick={() => setShowCreateTradeModal(true)}>
                Create a trade
              </button>
              <CreateTradeModal
                showCreateTradeModal={showCreateTradeModal}
                setShowCreateTradeModal={setShowCreateTradeModal}
                poolInfo={poolInfo}
                setPoolUpdate={setPoolUpdate}
                playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                injury={injury}
                user={user}
                DictUsers={DictUsers}
              />
            </>
          ) : null}
          <TabPanel>
            {poolInfo.trades
              .filter(trade => trade.status === 'NEW')
              .map(tradeInfo => (
                <table className="content-table-no-hover">
                  <tbody>
                    <tr>
                      <th>
                        <TradeItem
                          tradeInfo={tradeInfo}
                          playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                          DictUsers={DictUsers}
                        />
                      </th>
                      <th>
                        {tradeInfo.proposed_by === user._id.$oid ? (
                          <button onClick={() => cancel_trade(tradeInfo.id)} type="button" className="base-button">
                            Cancel
                          </button>
                        ) : null}
                        {tradeInfo.ask_to === user._id.$oid ||
                        poolInfo.owner === user._id.$oid ||
                        poolInfo.assistants.includes(user._id.$oid) ? (
                          <button
                            onClick={() => respond_trade(tradeInfo.id, true)}
                            type="button"
                            className="base-button"
                          >
                            Accept
                          </button>
                        ) : null}
                        {tradeInfo.ask_to === user._id.$oid ? (
                          <button
                            onClick={() => respond_trade(tradeInfo.id, false)}
                            type="button"
                            className="base-button"
                          >
                            Refuse
                          </button>
                        ) : null}
                      </th>
                      <th width="300px">{new Date(tradeInfo.date_created).toLocaleString('sv-SE')}</th>
                    </tr>
                  </tbody>
                </table>
              ))}{' '}
            {poolInfo.trades
              .filter(trade => trade.status === 'ACCEPTED')
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
                      <th width="300px">{new Date(tradeInfo.date_accepted).toLocaleString('sv-SE')}</th>
                    </tr>
                  </tbody>
                </table>
              ))}
          </TabPanel>
          <TabPanel>
            {poolInfo.trades
              .filter(trade => trade.status === 'REFUSED')
              .map(tradeInfo => (
                <table className="content-table-no-hover">
                  <tbody>
                    <tr>
                      <th>
                        <TradeItem
                          tradeInfo={tradeInfo}
                          playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                          DictUsers={DictUsers}
                        />
                      </th>
                      <th width="300px">{new Date(tradeInfo.date_created).toLocaleString('sv-SE')}</th>
                    </tr>
                  </tbody>
                </table>
              ))}
          </TabPanel>
          <TabPanel>
            {poolInfo.trades
              .filter(trade => trade.status === 'CANCELLED')
              .map(tradeInfo => (
                <table className="content-table-no-hover">
                  <tbody>
                    <tr>
                      <th>
                        <TradeItem
                          tradeInfo={tradeInfo}
                          playerIdToPlayersDataMap={playerIdToPlayersDataMap}
                          DictUsers={DictUsers}
                        />
                      </th>
                      <th width="300px">{new Date(tradeInfo.date_created).toLocaleString('sv-SE')}</th>
                    </tr>
                  </tbody>
                </table>
              ))}
          </TabPanel>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="cont">
      <h1>No trades have been created yet.</h1>
      {isUserParticipant ? (
        <>
          <button className="base-button" type="button" onClick={() => setShowCreateTradeModal(true)}>
            Create a trade
          </button>
          <CreateTradeModal
            showCreateTradeModal={showCreateTradeModal}
            setShowCreateTradeModal={setShowCreateTradeModal}
            poolInfo={poolInfo}
            setPoolUpdate={setPoolUpdate}
            playerIdToPlayersDataMap={playerIdToPlayersDataMap}
            user={user}
            DictUsers={DictUsers}
          />
        </>
      ) : null}
    </div>
  );
}

TradeCenter.propTypes = {
  poolInfo: PropTypes.shape({ trades: PropTypes.arrayOf() }).isRequired,
};
