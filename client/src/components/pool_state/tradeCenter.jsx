import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';

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
  hasOwnerRights,
  DictUsers,
  isUserParticipant,
}) {
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);

  const respond_trade = (tradeID, isAccepted) => {
    if (
      window.confirm(
        `Do you really want to ${
          isAccepted
            ? 'accept the trade? Players and picks will be transfered on this action'
            : 'refuse the trade? This action is not revertible.'
        }`
      )
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
        {poolInfo.trades
          .filter(trade => trade.status === 'NEW')
          .slice(0)
          .reverse()
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
                    {tradeInfo.ask_to === user._id.$oid || hasOwnerRights ? (
                      <button onClick={() => respond_trade(tradeInfo.id, true)} type="button" className="base-button">
                        Accept
                      </button>
                    ) : null}
                    {tradeInfo.ask_to === user._id.$oid ? (
                      <button onClick={() => respond_trade(tradeInfo.id, false)} type="button" className="base-button">
                        Refuse
                      </button>
                    ) : null}
                  </th>
                  <th width="300px">{new Date(tradeInfo.date_created).toLocaleString('sv-SE')}</th>
                </tr>
              </tbody>
            </table>
          ))}
        {poolInfo.trades
          .slice(0)
          .reverse()
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
