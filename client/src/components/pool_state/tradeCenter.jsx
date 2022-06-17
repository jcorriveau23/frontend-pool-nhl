import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';

// components
import TradeItem from './tradeItem';

// modal
import CreateTradeModal from '../../modals/createTrade';

export default function TradeCenter({ poolInfo, setPoolInfo, user, DictUsers, isUserParticipant }) {
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);

  const respond_trade = (tradeID, isAccepted) => {
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
          setPoolInfo(res.data.pool);
        } else {
          alert(res.data.message);
        }
      });
  };
  const cancel_trade = tradeID => {
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
          setPoolInfo(res.data.pool);
        } else {
          alert(res.data.message);
        }
      });
  };

  if (poolInfo.trades) {
    return (
      <div className="cont">
        <h1>Open Trades</h1>
        {poolInfo.trades
          .filter(trade => trade.status === 'NEW')
          .map(tradeInfo => (
            <table className="content-table-no-hover">
              <tbody>
                <tr>
                  <th>{tradeInfo.status}</th>
                  <th>
                    <TradeItem tradeInfo={tradeInfo} DictUsers={DictUsers} />
                  </th>
                  <th>
                    {tradeInfo.proposed_by === user._id.$oid ? (
                      <button onClick={() => cancel_trade(tradeInfo.id)} type="button">
                        Cancel
                      </button>
                    ) : null}
                  </th>
                  <th>
                    {tradeInfo.ask_to === user._id.$oid ? (
                      <button onClick={() => respond_trade(tradeInfo.id, true)} type="button">
                        Accept
                      </button>
                    ) : null}
                  </th>
                  <th>
                    {tradeInfo.ask_to === user._id.$oid ? (
                      <button onClick={() => respond_trade(tradeInfo.id, false)} type="button">
                        Refuse
                      </button>
                    ) : null}
                  </th>
                </tr>
              </tbody>
            </table>
          ))}
        <h1>Accepted Trades</h1>
        {poolInfo.trades
          .filter(trade => trade.status === 'ACCEPTED')
          .map(tradeInfo => (
            <table className="content-table-no-hover">
              <tbody>
                <tr>
                  <th>
                    {tradeInfo.status} on {new Date(tradeInfo.dateAccepted).toISOString().split('T')[0]}
                  </th>
                  <th>
                    <TradeItem tradeInfo={tradeInfo} DictUsers={DictUsers} />
                  </th>
                </tr>
              </tbody>
            </table>
          ))}
        <h1>Refused Trades</h1>
        {poolInfo.trades
          .filter(trade => trade.status === 'REFUSED')
          .map(tradeInfo => (
            <table className="content-table-no-hover">
              <tbody>
                <tr>
                  <th>{tradeInfo.status}</th>
                  <th>
                    <TradeItem tradeInfo={tradeInfo} DictUsers={DictUsers} />
                  </th>
                </tr>
              </tbody>
            </table>
          ))}
        <h1>Completed Trades</h1>
        {poolInfo.trades
          .filter(trade => trade.status === 'COMPLETED')
          .map(tradeInfo => (
            <table className="content-table-no-hover">
              <tbody>
                <tr>
                  <th>{tradeInfo.status}</th>
                  <th>
                    <TradeItem tradeInfo={tradeInfo} DictUsers={DictUsers} />
                  </th>
                </tr>
              </tbody>
            </table>
          ))}
        {isUserParticipant ? (
          <>
            <button className="base-button" type="button" onClick={() => setShowCreateTradeModal(true)}>
              Create a trade
            </button>
            <CreateTradeModal
              showCreateTradeModal={showCreateTradeModal}
              setShowCreateTradeModal={setShowCreateTradeModal}
              poolInfo={poolInfo}
              setPoolInfo={setPoolInfo}
              user={user}
              DictUsers={DictUsers}
            />
          </>
        ) : null}
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
            setPoolInfo={setPoolInfo}
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
