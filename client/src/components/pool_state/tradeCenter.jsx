import React, { useState } from 'react';
import PropTypes from 'prop-types';

// components
import TradeItem from './tradeItem';

// modal
import CreateTradeModal from '../../modals/createTrade';

export default function TradeCenter({ poolInfo, user, DictUsers }) {
  const [showCreateTradeModal, setShowCreateTradeModal] = useState(false);

  return (
    <div className="cont">
      <h1>Open Trades</h1>
      {poolInfo.openTrades.map(tradeInfo => (
        <TradeItem tradeInfo={tradeInfo} DictUsers={DictUsers} />
      ))}
      <h1>Completed Trades</h1>
      {poolInfo.completedTrades.map(tradeInfo => (
        <TradeItem tradeInfo={tradeInfo} DictUsers={DictUsers} />
      ))}
      <button className="base-button" type="button" onClick={() => setShowCreateTradeModal(true)}>
        Create a trade
      </button>
      <CreateTradeModal
        showCreateTradeModal={showCreateTradeModal}
        setShowCreateTradeModal={setShowCreateTradeModal}
        poolInfo={poolInfo}
        user={user}
        DictUsers={DictUsers}
      />
    </div>
  );
}

TradeCenter.propTypes = {
  poolInfo: PropTypes.shape({ openTrades: PropTypes.arrayOf(), completedTrades: PropTypes.arrayOf() }).isRequired,
};
