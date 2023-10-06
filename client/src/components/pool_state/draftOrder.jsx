import React, { useState, useEffect } from 'react';
import { ImArrowRight } from 'react-icons/im';

// Components
import PlayerNoLink from '../playerNoLink';
import User from '../user';

// image
import { team_info } from '../img/logos';

export default function DraftOrder({ poolInfo, injury, DictUsers, setNextDrafter, user }) {
  const [nbPlayers, setNbPlayers] = useState(0);
  const [totalColumns, setTotalColumns] = useState(0);

  useEffect(() => {
    setNbPlayers(
      poolInfo.settings.number_forwards +
        poolInfo.settings.number_defenders +
        poolInfo.settings.number_goalies +
        poolInfo.settings.number_reservists
    );
    setTotalColumns(poolInfo.status === 'Draft' ? 5 : 4);
  }, [poolInfo]);

  const render_table_header = () => (
    <tr>
      <th colSpan={totalColumns}>Draft Order</th>
    </tr>
  );

  const isDraftDone = participantsToRosterCountDict => {
    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      if (participantsToRosterCountDict[poolInfo.participants[i]] < nbPlayers) {
        return false;
      }
    }
    return true;
  };

  const render_players_columns = player_drafted =>
    poolInfo.context.players && poolInfo.context.players[player_drafted] ? (
      <>
        <td>
          <PlayerNoLink name={poolInfo.context.players[player_drafted].name} injury={injury} />
        </td>
        <td>
          <img src={team_info[poolInfo.context.players[player_drafted].team]?.logo} alt="" width="30" height="30" />
        </td>
      </>
    ) : (
      <>
        <td>{null}</td>
        <td>{null}</td>
      </>
    );

  const render_pick_row = (
    _player_drafted,
    _player_drafted_index,
    _real_next_drafter,
    _next_drafter,
    _isUserDone,
    _isUserTurn
  ) => (
    <tr>
      {poolInfo.status === 'Draft' ? (
        <td>{_isUserTurn ? <ImArrowRight size={30} style={{ color: 'green' }} /> : null}</td>
      ) : null}
      <td>{_player_drafted_index + 1}</td>
      {_real_next_drafter !== _next_drafter ? (
        <td>
          <User id={_real_next_drafter} user={user} DictUsers={DictUsers} noColor />
          <b style={{ color: 'red' }}> (From {DictUsers ? DictUsers[_next_drafter] : _next_drafter})</b>
        </td>
      ) : (
        <td>
          <User id={_next_drafter} user={user} DictUsers={DictUsers} noColor />
        </td>
      )}
      {_isUserDone ? (
        <td colSpan={2}>
          <b style={{ color: 'red' }}>Done</b>
        </td>
      ) : (
        render_players_columns(_player_drafted)
      )}
    </tr>
  );

  const render_table_body = () => {
    const participantsToRosterCountDict = {};

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      participantsToRosterCountDict[poolInfo.participants[i]] = poolInfo.final_rank
        ? poolInfo.settings.dynastie_settings.next_season_number_players_protected
        : 0; // initiate count to 0
    }

    const rounds = []; // round_index + 1 = round #
    let player_drafted_index = 0;
    let round_index = 0;

    let isUserTurnFound = false;

    while (!isDraftDone(participantsToRosterCountDict)) {
      const picks = [];

      picks.push(
        <tr>
          <th colSpan={totalColumns}>Round {round_index + 1}</th>
        </tr>
      );

      picks.push(
        <tr>
          {poolInfo.status === 'Draft' ? <th>Turn</th> : null}
          <th>#</th>
          <th>Pooler</th>
          <th>Name</th>
          <th>Team</th>
        </tr>
      );

      if (poolInfo.final_rank) {
        for (let j = 0; j < poolInfo.final_rank.length; j += 1) {
          // j = pick number in the round
          const player_drafted =
            poolInfo.context.players_name_drafted.length > player_drafted_index
              ? poolInfo.context.players_name_drafted[player_drafted_index]
              : null;
          let isUserTurn = false;

          if (poolInfo.context.past_tradable_picks && round_index < poolInfo.context.past_tradable_picks.length) {
            // we use tradable picks to find to process the next drafter
            const next_drafter = poolInfo.final_rank[poolInfo.final_rank.length - 1 - j];
            const real_next_drafter = poolInfo.context.past_tradable_picks[round_index][next_drafter] ?? next_drafter;

            participantsToRosterCountDict[real_next_drafter] += 1;
            const isUserDone = participantsToRosterCountDict[real_next_drafter] > nbPlayers;

            if (
              !isUserTurnFound &&
              player_drafted_index >= poolInfo.context.players_name_drafted.length &&
              participantsToRosterCountDict[real_next_drafter] < nbPlayers
            ) {
              // We take the first participants that do not have completed its roster for the next user turn
              isUserTurn = true;
              isUserTurnFound = true;
              if (setNextDrafter) setNextDrafter(real_next_drafter);
            }

            picks.push(
              render_pick_row(
                player_drafted,
                player_drafted_index,
                real_next_drafter,
                next_drafter,
                isUserDone,
                isUserTurn
              )
            );
          } else {
            // the next drafter comes from final_rank
            const next_drafter = poolInfo.final_rank[poolInfo.final_rank.length - 1 - j];
            participantsToRosterCountDict[next_drafter] += 1;
            const isUserDone = participantsToRosterCountDict[next_drafter] > nbPlayers;

            if (
              !isUserTurnFound &&
              player_drafted_index >= poolInfo.context.players_name_drafted.length &&
              participantsToRosterCountDict[next_drafter] < nbPlayers
            ) {
              // We take the first participants that do not have completed its roster for the next user turn
              isUserTurn = true;
              isUserTurnFound = true;
              if (setNextDrafter) setNextDrafter(next_drafter);
            }

            picks.push(
              render_pick_row(player_drafted, player_drafted_index, next_drafter, next_drafter, isUserDone, isUserTurn)
            );
          }
          player_drafted_index += 1;
        }
      } else {
        // Comes from new draft
        for (let j = 0; j < poolInfo.participants.length; j += 1) {
          // j = pick number in the round
          const player_drafted =
            poolInfo.context.players_name_drafted.length > player_drafted_index
              ? poolInfo.context.players_name_drafted[player_drafted_index]
              : null;

          // Snake draft, reverse draft order each round.
          const next_drafter =
            round_index % 2 ? poolInfo.participants[poolInfo.participants.length - 1 - j] : poolInfo.participants[j];

          participantsToRosterCountDict[next_drafter] += 1;
          const isUserTurn = player_drafted_index === poolInfo.context.players_name_drafted.length;

          if (isUserTurn) {
            if (setNextDrafter) setNextDrafter(next_drafter);
          }

          picks.push(
            render_pick_row(player_drafted, player_drafted_index, next_drafter, next_drafter, false, isUserTurn)
          );

          player_drafted_index += 1;
        }
      }

      rounds.push(picks);
      round_index += 1;
    }

    return rounds;
  };

  return (
    <table className="content-table-no-min">
      <thead>{render_table_header()}</thead>
      <tbody>{render_table_body().map(round => round)}</tbody>
    </table>
  );
}
