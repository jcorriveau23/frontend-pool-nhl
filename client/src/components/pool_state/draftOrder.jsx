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
  DictUsers,
}) {
  const render_table_header = () => (
    <tr>
      <th colSpan={4}>Draft Order</th>
    </tr>
  );

  const render_table_body = () => {
    const nb_round = nb_players - nb_protected_players;
    const rounds = [];
    let player_drafted_index = 0;

    for (let i = 0; i < nb_round; i += 1) {
      const picks = [];
      // i + 1 = round #

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
      for (let j = 0; j < final_rank.length; j += 1) {
        // j = pick number in the round
        const player_drafted =
          players_name_drafted.length > player_drafted_index ? players_name_drafted[player_drafted_index] : null;
        const isUserTurn = player_drafted_index === players_name_drafted.length;
        if (final_rank) {
          if (tradable_picks && i < tradable_picks.length) {
            // we use tradable picks to find to process the next drafter
            const next_drafter = final_rank[final_rank.length - 1 - j];

            const isPickTraded = next_drafter !== tradable_picks[i][next_drafter]; // was the pick traded last season ?

            picks.push(
              <tr>
                <td>{isUserTurn ? <ImArrowRight size={30} style={{ color: 'green' }} /> : null}</td>
                <td>{player_drafted_index + 1}</td>
                {isPickTraded ? (
                  <td style={{ color: 'red' }}>
                    {DictUsers ? DictUsers[tradable_picks[i][next_drafter]] : tradable_picks[i][next_drafter]} (From{' '}
                    {DictUsers ? DictUsers[next_drafter] : next_drafter})
                  </td>
                ) : (
                  <td>{DictUsers ? DictUsers[tradable_picks[i][next_drafter]] : tradable_picks[i][next_drafter]}</td>
                )}

                <td>
                  <PlayerNoLink name={player_drafted} injury={injury} />
                </td>
              </tr>
            );
          } else {
            // the next drafter comes from final_rank
            picks.push(
              <tr>
                <td>{isUserTurn ? <ImArrowRight size={30} /> : null}</td>
                <td>{player_drafted_index + 1}</td>
                <td>
                  {DictUsers ? DictUsers[final_rank[final_rank.length - 1 - j]] : final_rank[final_rank.length - 1 - j]}
                </td>
                <td>
                  <PlayerNoLink name={player_drafted} injury={injury} />
                </td>
              </tr>
            );
          }
        } else {
          // Comes from new draft
          picks.push(
            <tr>
              <td>{isUserTurn ? <ImArrowRight size={30} /> : null}</td>
              <td>{player_drafted_index + 1}</td>
              <td>{DictUsers ? DictUsers[participants[j]] : participants[j]}</td>
              <td>
                <PlayerNoLink name={player_drafted} injury={injury} />
              </td>
            </tr>
          );
        }

        player_drafted_index += 1;
      }

      rounds.push(picks);
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
