import React from 'react';
import PropTypes from 'prop-types';

export default function TradeItem({ tradeInfo, DictUsers, setFromPlayers, setFromPicks, setToPlayers, setToPicks }) {
  const remove_player = (players, setPlayers, player) => {
    const playersTmp = players;

    const index = playersTmp.findIndex(p => p.id === player.id);

    if (index > -1) {
      playersTmp.splice(index, 1);
    }
    setPlayers([...playersTmp]);
  };

  const remove_pick = (picks, setPicks, pick) => {
    const picksTmp = picks;

    const index = picksTmp.findIndex(p => p.rank === pick.rank && p.player === pick.player);

    if (index > -1) {
      picksTmp.splice(index, 1);
    }
    setPicks([...picksTmp]);
  };

  const render_trade_side = (Items, fromTo, setPlayers, setPicks) => (
    <table className="content-table-no-min">
      <thead>
        <tr>
          <th colSpan={2}>{DictUsers ? DictUsers[fromTo] : fromTo}</th>
        </tr>
      </thead>
      <tbody>
        {Items.players.map(player => (
          <tr onClick={() => remove_player(Items.players, setPlayers, player)}>
            <td colSpan={2}>{player.name}</td>
          </tr>
        ))}
        <tr>
          <th>Round pick</th>
          <th>From</th>
        </tr>
        {Items.picks.map(pick => (
          <tr onClick={() => remove_pick(Items.picks, setPicks, pick)}>
            <td>{pick.rank}</td>
            <td>{DictUsers ? DictUsers[pick.player] : pick.player}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <table width="80%">
        <tbody>
          <tr>
            <th>{render_trade_side(tradeInfo.fromItems, tradeInfo.proposedBy, setFromPlayers, setFromPicks)}</th>
            <th>{'<->' /* TODO Add trading image */}</th>
            <th>{render_trade_side(tradeInfo.toItems, tradeInfo.askTo, setToPlayers, setToPicks)}</th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

TradeItem.propTypes = {
  tradeInfo: PropTypes.shape({
    proposedBy: PropTypes.string.isRequired,
    askTo: PropTypes.string.isRequired,
    fromItems: PropTypes.shape({
      picks: PropTypes.arrayOf({
        rank: PropTypes.number.isRequired,
        player: PropTypes.string.isRequired /* id of the pooler pick for next season */,
      }).isRequired,
      players: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    toItems: PropTypes.shape({
      picks: PropTypes.arrayOf({
        rank: PropTypes.number.isRequired,
        player: PropTypes.string.isRequired /* id of the pooler pick for next season */,
      }).isRequired,
      players: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
