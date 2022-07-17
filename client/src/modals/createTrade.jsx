// This modals pops up when the detected wallet is not connected on the Kovan Network.
// It then prevent the user from doing anything on the web site.
// A button gives a quick access to the user to automaticly switch Network.

import React, { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { Tabs, TabList, TabPanel, Tab } from 'react-tabs';
import axios from 'axios';
import Cookies from 'js-cookie';
// components
import PlayerList from '../components/pool_state/playerList';
import TradeItem from '../components/pool_state/tradeItem';

// css
import './modal.css';

// images
import { logos } from '../components/img/logos';

export default function CreateTradeModal({
  showCreateTradeModal,
  setShowCreateTradeModal,
  poolInfo,
  setPoolInfo,
  user,
  DictUsers,
}) {
  const [fromPlayers, setFromPlayers] = useState([]);
  const [fromPicks, setFromPicks] = useState([]);
  const [toPlayers, setToPlayers] = useState([]);
  const [toPicks, setToPicks] = useState([]);
  const [selectedPooler, setSelectedPooler] = useState(
    poolInfo.participants[0] === user._id.$oid ? poolInfo.participants[1] : poolInfo.participants[0]
  );

  const send_trade = () => {
    const tradeInfo = {
      proposed_by: user._id.$oid,
      ask_to: selectedPooler,
      from_items: { players: fromPlayers, picks: fromPicks },
      to_items: { players: toPlayers, picks: toPicks },
      id: 0,
      status: 'NEW',
      date_accepted: '',
    };

    axios
      .post(
        '/api-rust/create-trade',
        { trade: tradeInfo, name: poolInfo.name },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        }
      )
      .then(res => {
        console.log(res.data);
        if (res.data.success) {
          // the trade will need to be confirmed by the user that was selected by the trader.
          // if the trade is accepted, people have 24h to create a counter offer. They can directly get out of the trade.
          // The players in the trade won't cumulate points the day they are traded.
          // At the end of the 24 hours, the traded players won't go in the roster they will go in the reservists.
          // user will be able to make a reservists switch (only add player to roster to fill hole, not remove players from roster) on that day, and the players can receive points on that day

          setShowCreateTradeModal(false);
          setPoolInfo(res.data.pool);
        } else {
          alert(res.data.pool);
        }
      });
  };

  const validate_trade_size = (players, picks) => {
    if (players.length + picks.length >= 5) {
      alert('You cannot make a trade with more than 5 items on a single side!');
      return false;
    }
    return true;
  };

  const validate_double_player = (players, player) => {
    if (players.findIndex(p => p.id === player.id) > -1) {
      alert('You cannot add 2 times the same player!');
      return false;
    }

    return true;
  };

  const validate_double_pick = (picks, pick) => {
    if (picks.findIndex(p => p.rank === pick.rank && p.player === pick.player) > -1) {
      alert('You cannot add 2 times the same pick!');
      return false;
    }

    return true;
  };

  const add_player = (side, player) => {
    switch (side) {
      case 'to': {
        if (validate_trade_size(toPlayers, toPicks) && validate_double_player(toPlayers, player)) {
          setToPlayers(oldToPlayers => [...oldToPlayers, player]);
        }
        break;
      }
      case 'from': {
        if (validate_trade_size(fromPlayers, fromPicks) && validate_double_player(fromPlayers, player)) {
          setFromPlayers(oldFromPlayers => [...oldFromPlayers, player]);
        }
        break;
      }
      default:
        break;
    }
  };

  const add_pick = (side, pick) => {
    switch (side) {
      case 'to': {
        if (validate_trade_size(toPlayers, toPicks) && validate_double_pick(toPicks, pick)) {
          setToPicks(oldToPicks => [...oldToPicks, pick]);
        }
        break;
      }
      case 'from': {
        if (validate_trade_size(fromPlayers, fromPicks) && validate_double_pick(fromPicks, pick)) {
          setFromPicks(oldFromPicks => [...oldFromPicks, pick]);
        }
        break;
      }
      default:
        break;
    }
  };

  const render_players = (side, players, playersTraded) =>
    players
      .filter(player => playersTraded.findIndex(p => p.id === player.id) === -1)
      .map((player, i) => (
        <tr onClick={() => add_player(side, player)} key={player}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
        </tr>
      ));

  const render_tabs_choice_headers = position => (
    <>
      <tr>
        <th colSpan={3}>{position}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>name</th>
        <th>team</th>
      </tr>
    </>
  );

  const render_pooler_player_list = (side, poolerContext, playersTraded, picksTraded) => (
    <Tabs>
      <TabList>
        <Tab>Players</Tab>
        <Tab>Picks</Tab>
      </TabList>
      <TabPanel>
        <table className="content-table-no-min">
          <thead>{render_tabs_choice_headers('Forwards')}</thead>
          <tbody>{render_players(side, poolerContext.chosen_forwards, playersTraded)}</tbody>
        </table>
        <table className="content-table-no-min">
          <thead>{render_tabs_choice_headers('Defenders')}</thead>
          <tbody>{render_players(side, poolerContext.chosen_defenders, playersTraded)}</tbody>
        </table>
        <table className="content-table-no-min">
          <thead>{render_tabs_choice_headers('Goalies')}</thead>
          <tbody>{render_players(side, poolerContext.chosen_goalies, playersTraded)}</tbody>
        </table>
        <table className="content-table-no-min">
          <thead>{render_tabs_choice_headers('Reservists')}</thead>
          <tbody>{render_players(side, poolerContext.chosen_reservists, playersTraded)}</tbody>
        </table>
      </TabPanel>
      <TabPanel>
        <table className="content-table-no-min">
          <thead>
            <tr>
              <th>round</th>
              <th>owner</th>
            </tr>
          </thead>
          <tbody>
            {poolerContext.tradable_picks
              ? poolerContext.tradable_picks
                  .filter(pick => picksTraded.findIndex(p => p.rank === pick.rank && p.player === pick.player) === -1)
                  .map(pick => (
                    <tr onClick={() => add_pick(side, pick)} key={pick}>
                      <td>{pick.rank}</td>
                      <td>{DictUsers ? DictUsers[pick.player] : pick.player}</td>
                    </tr>
                  ))
              : null}
          </tbody>
        </table>
      </TabPanel>
    </Tabs>
  );

  return (
    <Modal
      className="big-base-modal"
      overlayClassName="baseOverlay"
      isOpen={showCreateTradeModal}
      appElement={document.getElementById('root')}
      onRequestClose={() => setShowCreateTradeModal(false)}
    >
      <div>
        <div className="cont">
          <h1>Create Trade</h1>
          <TradeItem
            tradeInfo={{
              proposed_by: user._id.$oid,
              ask_to: selectedPooler,
              from_items: { players: fromPlayers, picks: fromPicks },
              to_items: { players: toPlayers, picks: toPicks },
            }}
            setFromPlayers={setFromPlayers}
            setFromPicks={setFromPicks}
            setToPlayers={setToPlayers}
            setToPicks={setToPicks}
            DictUsers={DictUsers}
          />
          <button onClick={() => send_trade()} className="base-button" type="button">
            Create
          </button>
        </div>
        <div className="float-left">
          <div className="half-cont">
            {render_pooler_player_list('from', poolInfo.context.pooler_roster[user._id.$oid], fromPlayers, fromPicks)}
          </div>
        </div>
        <div className="float-right">
          <div className="half-cont">
            <select onChange={() => setSelectedPooler(event.target.value)} defaultValue={selectedPooler}>
              {poolInfo.participants
                .filter(pooler => pooler !== user._id.$oid)
                .map(pooler => (
                  <option value={pooler}>{DictUsers ? DictUsers[pooler] : pooler}</option>
                ))}
            </select>

            {render_pooler_player_list('to', poolInfo.context.pooler_roster[selectedPooler], toPlayers, toPicks)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

CreateTradeModal.propTypes = {};
