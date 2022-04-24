import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';

// components
import TradeItem from './tradeItem';

// modal
import CreateTradeModal from '../../modals/createTrade';

export default function TradeCenter({ poolInfo, setPoolInfo, user, DictUsers }) {
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);

  const respond_trade = (tradeID, isAccepted) => {
    axios
      .post('/api/pool/respond_trade', {
        token: Cookies.get(`token-${user._id}`),
        isAccepted,
        tradeID,
        name: poolInfo.name,
      })
      .then(res => {
        if (res.data.success) {
          setPoolInfo(res.data.message);
        } else {
          alert(res.data.message);
        }
      });
  };
  const cancel_trade = tradeID => {
    console.log('cancel');
    axios
      .post('/api/pool/cancel_trade', { token: Cookies.get(`token-${user._id}`), tradeID, name: poolInfo.name })
      .then(res => {
        if (res.data.success) {
          setPoolInfo(res.data.message);
        } else {
          alert(res.data.message);
        }
      });
  };

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
                  {tradeInfo.proposedBy === user._id ? (
                    <button onClick={() => cancel_trade(tradeInfo.id)} type="button">
                      Cancel
                    </button>
                  ) : null}
                </th>
                <th>
                  {tradeInfo.askTo === user._id ? (
                    <button onClick={() => respond_trade(tradeInfo.id, true)} type="button">
                      Accept
                    </button>
                  ) : null}
                </th>
                <th>
                  {tradeInfo.askTo === user._id ? (
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
    </div>
  );
}

TradeCenter.propTypes = {
  poolInfo: PropTypes.shape({ trades: PropTypes.arrayOf() }).isRequired,
};
