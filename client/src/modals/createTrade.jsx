// This modals pops up when the detected wallet is not connected on the Kovan Network.
// It then prevent the user from doing anything on the web site.
// A button gives a quick access to the user to automaticly switch Network.

import React, { useState } from 'react';
import Modal from 'react-modal';
import { Tabs, TabList, TabPanel, Tab } from 'react-tabs';
import axios from 'axios';
import Cookies from 'js-cookie';

// components
import PlayerNoLink from '../components/playerNoLink';
import PickList from '../components/pool_state/pickList';
import TradeItem from '../components/pool_state/tradeItem';

// css
import './modal.css';

// images
import { team_info } from '../components/img/logos';

export default function CreateTradeModal({
  showCreateTradeModal,
  setShowCreateTradeModal,
  poolInfo,
  setPoolUpdate,
  injury,
  user,
  DictUsers,
}) {
  const [fromPlayers, setFromPlayers] = useState([]);
  const [fromPicks, setFromPicks] = useState([]);
  const [toPlayers, setToPlayers] = useState([]);
  const [toPicks, setToPicks] = useState([]);
  const [fromSelectedPooler, setFromSelectedPooler] = useState(user._id);
  const [toSelectedPooler, setToSelectedPooler] = useState(
    poolInfo.participants[0] === user?._id ? poolInfo.participants[1] : poolInfo.participants[0]
  );

  const reset_from_items = () => {
    setFromPlayers([]);
    setFromPicks([]);
  };

  const reset_to_items = () => {
    setToPlayers([]);
    setToPicks([]);
  };

  const complete_reset = closeModal => {
    reset_from_items();
    reset_to_items();
    if (closeModal) setShowCreateTradeModal(false);
  };

  const on_change_to_selection = participant => {
    reset_to_items();
    setToSelectedPooler(participant);
  };

  const on_change_from_selection = participant => {
    reset_from_items();
    setFromSelectedPooler(participant);
  };

  const send_trade = async () => {
    const tradeInfo = {
      proposed_by: fromSelectedPooler,
      ask_to: toSelectedPooler,
      from_items: { players: fromPlayers, picks: fromPicks },
      to_items: { players: toPlayers, picks: toPicks },
      id: 0,
      status: 'NEW',
      date_accepted: -1,
      date_created: -1,
    };

    try {
      await axios.post(
        '/api-rust/create-trade',
        { pool_name: poolInfo.name, trade: tradeInfo },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id}`)}` },
        }
      );
      setShowCreateTradeModal(false);
      setPoolUpdate(true);
    } catch (e) {
      alert(e.response.data);
    }
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

  const validate_double_pick = (picks, round, from) => {
    if (picks.findIndex(p => p.round === round && p.from === from) > -1) {
      alert('You cannot add 2 times the same pick!');
      return false;
    }

    return true;
  };

  const add_player = (side, player) => {
    switch (side) {
      case 'to': {
        if (validate_trade_size(toPlayers, toPicks) && validate_double_player(toPlayers, player)) {
          setToPlayers(oldToPlayers => [...oldToPlayers, player.id]);
        }
        break;
      }
      case 'from': {
        if (validate_trade_size(fromPlayers, fromPicks) && validate_double_player(fromPlayers, player)) {
          setFromPlayers(oldFromPlayers => [...oldFromPlayers, player.id]);
        }
        break;
      }
      default:
        break;
    }
  };

  const add_pick = (side, round, from) => {
    switch (side) {
      case 'to': {
        if (validate_trade_size(toPlayers, toPicks) && validate_double_pick(toPicks, round, from)) {
          setToPicks(oldToPicks => [...oldToPicks, { round, from }]);
        }
        break;
      }
      case 'from': {
        if (validate_trade_size(fromPlayers, fromPicks) && validate_double_pick(fromPicks, round, from)) {
          setFromPicks(oldFromPicks => [...oldFromPicks, { round, from }]);
        }
        break;
      }
      default:
        break;
    }
  };

  const render_players = (side, players, playersTraded) =>
    players
      .filter(playerId => playersTraded.findIndex(p => p === playerId) === -1)
      .map((playerId, i) => (
        <tr onClick={() => add_player(side, poolInfo.context.players[playerId])} key={playerId}>
          <td>{i + 1}</td>
          <PlayerNoLink name={poolInfo.context.players[playerId].name} injury={injury} />
          <td>
            <img src={team_info[poolInfo.context.players[playerId].team]?.logo} alt="" width="40" height="40" />
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

  const render_pooler_player_list = (side, poolerContext, participant, playersTraded, picksTraded) => (
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
        <PickList
          tradablePicks={poolInfo.context.tradable_picks}
          participant={participant}
          add_pick={add_pick}
          side={side}
          filterPicks={picksTraded}
          DictUsers={DictUsers}
        />
      </TabPanel>
    </Tabs>
  );

  return (
    <Modal
      className="big-base-modal"
      overlayClassName="base-overlay"
      isOpen={showCreateTradeModal}
      appElement={document.getElementById('root')}
      onRequestClose={() => complete_reset(true)}
    >
      <div>
        <div className="half-cont">
          <h1>Create Trade</h1>
          <TradeItem
            tradeInfo={{
              proposed_by: fromSelectedPooler,
              ask_to: toSelectedPooler,
              from_items: { players: fromPlayers, picks: fromPicks },
              to_items: { players: toPlayers, picks: toPicks },
            }}
            poolInfo={poolInfo}
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
            <select
              onChange={event => on_change_from_selection(event.target.value)}
              defaultValue={fromSelectedPooler}
              disabled={poolInfo.owner !== user._id && !poolInfo.settings.assistants.includes(user._id)}
            >
              {poolInfo.participants.map(pooler => (
                <option value={pooler}>{DictUsers ? DictUsers[pooler] : pooler}</option>
              ))}
            </select>
            {render_pooler_player_list(
              'from',
              poolInfo.context.pooler_roster[fromSelectedPooler],
              fromSelectedPooler,
              fromPlayers,
              fromPicks
            )}
          </div>
        </div>
        <div className="float-right">
          <div className="half-cont">
            <select onChange={event => on_change_to_selection(event.target.value)} defaultValue={toSelectedPooler}>
              {poolInfo.participants
                .filter(pooler => pooler !== user._id)
                .map(pooler => (
                  <option value={pooler}>{DictUsers ? DictUsers[pooler] : pooler}</option>
                ))}
            </select>
            {render_pooler_player_list(
              'to',
              poolInfo.context.pooler_roster[toSelectedPooler],
              toSelectedPooler,
              toPlayers,
              toPicks
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
