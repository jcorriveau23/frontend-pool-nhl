import React from 'react';
import PropTypes from 'prop-types';
import { FaExchangeAlt } from 'react-icons/fa';

export default function TradeItem({
  tradeInfo,
  playerIdToPlayersDataMap,
  DictUsers,
  setFromPlayers,
  setFromPicks,
  setToPlayers,
  setToPicks,
}) {
  const remove_player = (players, setPlayers, player) => {
    const playersTmp = players;

    const index = playersTmp.findIndex(p => p === player);

    if (index > -1) {
      playersTmp.splice(index, 1);
    }
    setPlayers([...playersTmp]);
  };

  const remove_pick = (picks, setPicks, pick) => {
    const picksTmp = picks;

    const index = picksTmp.findIndex(p => p.round === pick.round && p.from === pick.from);

    if (index > -1) {
      picksTmp.splice(index, 1);
    }
    setPicks([...picksTmp]);
  };

  const render_trade_side = (items, fromTo, setPlayers, setPicks) => (
    <table className="content-table-no-min">
      <thead>
        <tr>
          <th colSpan={2}>{DictUsers ? DictUsers[fromTo] : fromTo}</th>
        </tr>
      </thead>
      <tbody>
        {items.players.map(player => (
          <tr onClick={setPlayers ? () => remove_player(items.players, setPlayers, player) : null}>
            <td colSpan={2}>{playerIdToPlayersDataMap[player].name}</td>
          </tr>
        ))}
        {items.picks.length > 0 ? (
          <>
            <tr>
              <th>Round pick</th>
              <th>From</th>
            </tr>
            {items.picks.map(pick => (
              <tr onClick={setPicks ? () => remove_pick(items.picks, setPicks, pick) : null}>
                <td>{pick.round + 1}</td>
                <td>{DictUsers ? DictUsers[pick.from] : pick.from}</td>
              </tr>
            ))}
          </>
        ) : null}
      </tbody>
    </table>
  );

  return (
    <div>
      <table width="100%">
        <tbody>
          <tr>
            <th width="45%">
              {render_trade_side(tradeInfo.from_items, tradeInfo.proposed_by, setFromPlayers, setFromPicks)}
            </th>
            <th width="10%">
              <FaExchangeAlt size={30} />
            </th>
            <th width="45%">{render_trade_side(tradeInfo.to_items, tradeInfo.ask_to, setToPlayers, setToPicks)}</th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

TradeItem.propTypes = {
  tradeInfo: PropTypes.shape({
    proposed_by: PropTypes.string.isRequired,
    ask_to: PropTypes.string.isRequired,
    from_items: PropTypes.shape({
      picks: PropTypes.arrayOf({
        round: PropTypes.number.isRequired,
        from: PropTypes.string.isRequired /* id of the pooler pick for next season */,
      }).isRequired,
      players: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        position: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    to_items: PropTypes.shape({
      picks: PropTypes.arrayOf({
        round: PropTypes.number.isRequired,
        from: PropTypes.string.isRequired /* id of the pooler pick for next season */,
      }).isRequired,
      players: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        position: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
