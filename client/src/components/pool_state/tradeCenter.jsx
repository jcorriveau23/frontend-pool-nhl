import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import { AiFillCheckCircle } from 'react-icons/ai';

// components
import TradeItem from './tradeItem';

// modal
import CreateTradeModal from '../../modals/createTrade';

export default function TradeCenter({ poolInfo, setPoolUpdate, injury, user, hasOwnerRights, DictUsers, userIndex }) {
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);

  const respond_trade = async (tradeID, isAccepted) => {
    if (
      window.confirm(
        `Do you really want to ${
          isAccepted
            ? 'accept the trade? Players and picks will be transfered on this action'
            : 'refuse the trade? This action is not revertible.'
        }`
      )
    ) {
      try {
        await axios.post(
          '/api-rust/respond-trade',
          { pool_name: poolInfo.name, trade_id: tradeID, is_accepted: isAccepted },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id}`)}` },
          }
        );
        setPoolUpdate(true);
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  const cancel_trade = async tradeID => {
    if (window.confirm(`Do you really want to cancel the trade?`)) {
      try {
        await axios.post(
          '/api-rust/delete-trade',
          { pool_name: poolInfo.name, trade_id: tradeID },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id}`)}` },
          }
        );
        setPoolUpdate(true);
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  if (poolInfo.trades) {
    return (
      <div className="half-cont">
        {poolInfo.participants.includes(user?._id) ? (
          <>
            <button className="base-button" type="button" onClick={() => setShowCreateTradeModal(true)}>
              Create a trade
            </button>
            <CreateTradeModal
              showCreateTradeModal={showCreateTradeModal}
              setShowCreateTradeModal={setShowCreateTradeModal}
              poolInfo={poolInfo}
              setPoolUpdate={setPoolUpdate}
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
                    <TradeItem tradeInfo={tradeInfo} poolInfo={poolInfo} DictUsers={DictUsers} />
                  </th>
                  <th>
                    {tradeInfo.proposed_by === user?._id ? (
                      <button onClick={() => cancel_trade(tradeInfo.id)} type="button" className="base-button">
                        Cancel
                      </button>
                    ) : null}
                    {tradeInfo.ask_to === user?._id || hasOwnerRights ? (
                      <button onClick={() => respond_trade(tradeInfo.id, true)} type="button" className="base-button">
                        Accept
                      </button>
                    ) : null}
                    {tradeInfo.ask_to === user?._id ? (
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
                    <TradeItem tradeInfo={tradeInfo} poolInfo={poolInfo} DictUsers={DictUsers} />
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
      {userIndex > -1 ? (
        <>
          <button className="base-button" type="button" onClick={() => setShowCreateTradeModal(true)}>
            Create a trade
          </button>
          <CreateTradeModal
            showCreateTradeModal={showCreateTradeModal}
            setShowCreateTradeModal={setShowCreateTradeModal}
            poolInfo={poolInfo}
            setPoolUpdate={setPoolUpdate}
            user={user}
            DictUsers={DictUsers}
          />
        </>
      ) : null}
    </div>
  );
}
