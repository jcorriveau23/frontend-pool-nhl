import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import PlayerNoLink from '../playerNoLink';

// Icons
import { ImArrowRight } from 'react-icons/im';

export default function DraftOrder({
  players_name_drafted,
  participants,
  final_rank,
  tradable_picks,
  nb_players, // nb of players in a participant team
  nb_protected_players, // next season protected players number
  injury,
  playerIdToPlayerNameDict,
  DictUsers,
  setNextDrafter,
}) {
  const render_table_header = () => (
    <tr>
      <th colSpan={4}>Draft Order</th>
    </tr>
  );

  const isDraftDone = participantsToRosterCountDict => {
    console.log(participantsToRosterCountDict);
    for (let i = 0; i < participants.length; i += 1) {
      if (participantsToRosterCountDict[participants[i]] < nb_players) {
        return false;
      }
    }
    return true;
  };

  const render_table_body = () => {
    const participantsToRosterCountDict = {};

    for (let i = 0; i < participants.length; i += 1) {
      participantsToRosterCountDict[participants[i]] = final_rank ? nb_protected_players : 0; // initiate count to 0
    }

    const rounds = []; // i + 1 = round #
    let player_drafted_index = 0;
    let i = 0;

    let isUserTurnFound = false;

    while (!isDraftDone(participantsToRosterCountDict)) {
      const picks = [];

      picks.push(
        <tr>
          <th colSpan={4}>Round {i + 1}</th>
        </tr>
      );

      picks.push(
        <tr>
          <th>Turn</th>
          <th>#</th>
          <th>Team</th>
          <th>Name</th>
        </tr>
      );

      if (final_rank) {
        for (let j = 0; j < final_rank.length; j += 1) {
          // j = pick number in the round
          const player_drafted =
            players_name_drafted.length > player_drafted_index ? players_name_drafted[player_drafted_index] : null;
          let isUserTurn = false;

          if (tradable_picks && i < tradable_picks.length) {
            // we use tradable picks to find to process the next drafter
            const next_drafter = final_rank[final_rank.length - 1 - j];
            const real_next_drafter = tradable_picks[i][next_drafter];

            const isUserDone = participantsToRosterCountDict[next_drafter] > nb_players;
            const isPickTraded = next_drafter !== tradable_picks[i][next_drafter]; // was the pick traded last season ?

            if (
              !isUserTurnFound &&
              player_drafted_index >= players_name_drafted.length &&
              participantsToRosterCountDict[real_next_drafter] < nb_players
            ) {
              // We take the first participants that do not have completed its roster for the next user turn
              isUserTurn = true;
              isUserTurnFound = true;
              if (setNextDrafter) setNextDrafter(real_next_drafter);
            }

            participantsToRosterCountDict[real_next_drafter] += 1;
            picks.push(
              <tr>
                <td>{isUserTurn ? <ImArrowRight size={30} style={{ color: 'green' }} /> : null}</td>
                <td>{player_drafted_index + 1}</td>
                {isPickTraded ? (
                  <td style={{ color: 'red' }}>
                    {DictUsers ? DictUsers[real_next_drafter] : real_next_drafter} (From{' '}
                    {DictUsers ? DictUsers[next_drafter] : next_drafter})
                  </td>
                ) : (
                  <td>{DictUsers ? DictUsers[real_next_drafter] : real_next_drafter}</td>
                )}

                <td>
                  {isUserDone ? (
                    <b style={{ color: 'red' }}>Done</b>
                  ) : (
                    <PlayerNoLink
                      name={playerIdToPlayerNameDict ? playerIdToPlayerNameDict[player_drafted] : player_drafted}
                      injury={injury}
                    />
                  )}
                </td>
              </tr>
            );
          } else {
            // the next drafter comes from final_rank
            const next_drafter = final_rank[final_rank.length - 1 - j];
            const isUserDone = participantsToRosterCountDict[next_drafter] > nb_players;

            if (
              !isUserTurnFound &&
              player_drafted_index >= players_name_drafted.length &&
              participantsToRosterCountDict[next_drafter] < nb_players
            ) {
              // We take the first participants that do not have completed its roster for the next user turn
              isUserTurn = true;
              isUserTurnFound = true;
              if (setNextDrafter) setNextDrafter(next_drafter);
            }
            participantsToRosterCountDict[next_drafter] += 1;

            picks.push(
              <tr>
                <td>{isUserTurn ? <ImArrowRight size={30} style={{ color: 'green' }} /> : null}</td>
                <td>{player_drafted_index + 1}</td>
                <td>{DictUsers ? DictUsers[next_drafter] : next_drafter}</td>
                <td>
                  {isUserDone ? (
                    <b style={{ color: 'red' }}>Done</b>
                  ) : (
                    <PlayerNoLink
                      name={playerIdToPlayerNameDict ? playerIdToPlayerNameDict[player_drafted] : player_drafted}
                      injury={injury}
                    />
                  )}
                </td>
              </tr>
            );
          }
          player_drafted_index += 1;
        }
      } else {
        // Comes from new draft
        for (let j = 0; j < participants.length; j += 1) {
          // j = pick number in the round
          const player_drafted =
            players_name_drafted.length > player_drafted_index ? players_name_drafted[player_drafted_index] : null;

          const next_drafter = participants[j];
          participantsToRosterCountDict[next_drafter] += 1;
          const isUserTurn = player_drafted_index === players_name_drafted.length;

          if (isUserTurn) {
            if (setNextDrafter) setNextDrafter(next_drafter);
          }

          picks.push(
            <tr>
              <td>{isUserTurn ? <ImArrowRight size={30} style={{ color: 'green' }} /> : null}</td>
              <td>{player_drafted_index + 1}</td>
              <td>{DictUsers ? DictUsers[next_drafter] : next_drafter}</td>
              <td>
                <PlayerNoLink
                  name={playerIdToPlayerNameDict ? playerIdToPlayerNameDict[player_drafted] : player_drafted}
                  injury={injury}
                />
              </td>
            </tr>
          );
          player_drafted_index += 1;
        }
      }

      rounds.push(picks);
      i += 1;
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

DraftOrder.propTypes = {};
