import React, { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BsGraphUp } from 'react-icons/bs';
import ClipLoader from 'react-spinners/ClipLoader';

import User from '../user';
import PlayerLink from '../playerLink';
import { logos } from '../img/logos';

import GraphCapHits from '../../modals/graphCapHits';

export default function RosterCapHit({
  poolInfo,
  selectedParticipantIndex,
  setUserTab,
  select_participant,
  injury,
  user,
  DictUsers,
}) {
  const [totalCapHitsByYears, setTotalCapHitsByYears] = useState(null);
  const [indexYear, setIndexYear] = useState(0);
  const [showGraphCapHits, setShowGraphCapHits] = useState(false);

  useEffect(() => {
    const totalCapHitsByYears_temp = [];

    for (let k = 0; k < 5; k += 1) {
      // k = 0 => current year
      // k = 1 => current year + 1
      // k = 2 => current year + 2
      // k = 3 => current year + 3
      // k = 4 => current year + 4
      const totalCapHits = [];

      for (let i = 0; i < poolInfo.participants.length; i += 1) {
        const participant = poolInfo.participants[i];

        const totalCapHit = { name: participant, F: 0, D: 0, G: 0, tot: 0 };
        const pooler_roster = poolInfo.context.pooler_roster[participant];

        // Forward
        for (let j = 0; j < pooler_roster.chosen_forwards.length; j += 1) {
          if (pooler_roster.chosen_forwards[j].caps.length > k)
            totalCapHit.F += parseInt(pooler_roster.chosen_forwards[j].caps[k], 10);
        }
        // Defender
        for (let j = 0; j < pooler_roster.chosen_defenders.length; j += 1) {
          if (pooler_roster.chosen_defenders[j].caps.length > k)
            totalCapHit.D += parseInt(pooler_roster.chosen_defenders[j].caps[k], 10);
        }
        // Goalies
        for (let j = 0; j < pooler_roster.chosen_goalies.length; j += 1) {
          // console.log(
          //   `${participant} - ${pooler_roster.chosen_goalies[j].name} - ${pooler_roster.chosen_goalies[j].caps}`
          // );
          if (pooler_roster.chosen_goalies[j].caps.length > k)
            totalCapHit.G += parseInt(pooler_roster.chosen_goalies[j].caps[k], 10);
        }
        // Reservists
        for (let j = 0; j < pooler_roster.chosen_reservists.length; j += 1) {
          switch (pooler_roster.chosen_reservists[j].position) {
            case 'F': {
              if (pooler_roster.chosen_reservists[j].caps.length > k)
                totalCapHit.F += parseInt(pooler_roster.chosen_reservists[j].caps[k], 10);
              break;
            }
            case 'D': {
              if (pooler_roster.chosen_reservists[j].caps.length > k)
                totalCapHit.D += parseInt(pooler_roster.chosen_reservists[j].caps[k], 10);
              break;
            }
            case 'G': {
              if (pooler_roster.chosen_reservists[j].caps.length > k)
                totalCapHit.G += parseInt(pooler_roster.chosen_reservists[j].caps[k], 10);
              break;
            }
            default:
              break;
          }
        }
        totalCapHit.tot = totalCapHit.F + totalCapHit.D + totalCapHit.G;
        totalCapHits.push(totalCapHit);
      }

      totalCapHitsByYears_temp.push(totalCapHits);
    }

    // console.log(totalCapHitsByYears_temp);
    setTotalCapHitsByYears(totalCapHitsByYears_temp);
  }, []);

  const cap_hit_value = x => {
    if (x) return `$${x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    return null;
  };

  const render_total_cap_hit_header = year => (
    <>
      <tr>
        <th colSpan={5}>Cap Hit by pooler ({year})</th>
      </tr>
      <tr>
        <th>Name</th>
        <th>Forwards</th>
        <th>Defenders</th>
        <th>Goalies</th>
        <th>Total</th>
      </tr>
    </>
  );

  const render_total_cap_hit_content = year =>
    // 0 = current year
    // 1 = current + 1 year
    // 2 = current + 2 year
    // 3 = current + 3 year
    // 4 = current + 4 year

    totalCapHitsByYears[year]
      .sort((cap1, cap2) => cap2.tot - cap1.tot)
      .map(total => (
        <tr
          onClick={() => select_participant(total.name)}
          style={
            poolInfo.participants[selectedParticipantIndex] === total.name
              ? { backgroundColor: '#eee', cursor: 'pointer' }
              : { cursor: 'pointer' }
          }
        >
          <td>
            <User id={total.name} user={user} DictUsers={DictUsers} />
          </td>
          <td>{cap_hit_value(total.F)}</td>
          <td>{cap_hit_value(total.D)}</td>
          <td>{cap_hit_value(total.G)}</td>
          <td>
            <b style={{ color: '#a20' }}>{cap_hit_value(total.tot)}</b>
          </td>
        </tr>
      ));

  const render_roster_with_cap_hit_header = position => (
    <>
      <tr>
        <th colSpan={8}>{position}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Team</th>
        <th>2022-2023</th>
        <th>2023-2024</th>
        <th>2024-2025</th>
        <th>2025-2026</th>
        <th>2026-2027</th>
      </tr>
    </>
  );

  const render_roster_with_cap_hit_content = (players, position, participant) => (
    <>
      {players
        .filter(player => player.position === position)
        .map((player, i) => (
          <tr>
            <td>{i + 1}</td>
            <td>
              <PlayerLink name={player.name} id={player.id} injury={injury} />
            </td>
            <td>
              <img src={logos[player.team]} alt="" width="30" height="30" />
            </td>
            <td style={indexYear === 0 ? { backgroundColor: '#eee' } : null}>{cap_hit_value(player.caps[0])}</td>
            <td style={indexYear === 1 ? { backgroundColor: '#eee' } : null}>{cap_hit_value(player.caps[1])}</td>
            <td style={indexYear === 2 ? { backgroundColor: '#eee' } : null}>{cap_hit_value(player.caps[2])}</td>
            <td style={indexYear === 3 ? { backgroundColor: '#eee' } : null}>{cap_hit_value(player.caps[3])}</td>
            <td style={indexYear === 4 ? { backgroundColor: '#eee' } : null}>{cap_hit_value(player.caps[4])}</td>
          </tr>
        ))}
      <tr>
        <th colSpan={3}>Total</th>
        <th>
          {cap_hit_value(
            totalCapHitsByYears[0][totalCapHitsByYears[0].findIndex(c => c.name === participant)][position]
          )}
        </th>
        <th>
          {cap_hit_value(
            totalCapHitsByYears[1][totalCapHitsByYears[1].findIndex(c => c.name === participant)][position]
          )}
        </th>
        <th>
          {cap_hit_value(
            totalCapHitsByYears[2][totalCapHitsByYears[2].findIndex(c => c.name === participant)][position]
          )}
        </th>
        <th>
          {cap_hit_value(
            totalCapHitsByYears[3][totalCapHitsByYears[3].findIndex(c => c.name === participant)][position]
          )}
        </th>
        <th>
          {cap_hit_value(
            totalCapHitsByYears[4][totalCapHitsByYears[4].findIndex(c => c.name === participant)][position]
          )}
        </th>
      </tr>
    </>
  );

  if (totalCapHitsByYears) {
    return (
      <div className="cont">
        <button className="base-button" onClick={() => setShowGraphCapHits(!showGraphCapHits)} type="button">
          <table>
            <tbody>
              <tr>
                <td>
                  <BsGraphUp size={30} />
                </td>
                <td width="75%">
                  <b>Graph</b>
                </td>
              </tr>
            </tbody>
          </table>
        </button>
        {showGraphCapHits ? (
          <GraphCapHits poolInfo={poolInfo} totalCapHitsByYears={totalCapHitsByYears} DictUsers={DictUsers} />
        ) : null}
        <Tabs selectedIndex={indexYear} onSelect={index => setIndexYear(index)}>
          <TabList>
            <Tab>2022-2023</Tab>
            <Tab>2023-2024</Tab>
            <Tab>2024-2025</Tab>
            <Tab>2025-2026</Tab>
            <Tab>2026-2027</Tab>
          </TabList>
          <TabPanel>
            <table className="content-table">
              {render_total_cap_hit_header('2022-2023')}
              {render_total_cap_hit_content(0)}
            </table>
          </TabPanel>
          <TabPanel>
            <table className="content-table">
              {render_total_cap_hit_header('2023-2024')}
              {render_total_cap_hit_content(1)}
            </table>
          </TabPanel>
          <TabPanel>
            <table className="content-table">
              {render_total_cap_hit_header('2024-2025')}
              {render_total_cap_hit_content(2)}
            </table>
          </TabPanel>
          <TabPanel>
            <table className="content-table">
              {render_total_cap_hit_header('2025-2026')}
              {render_total_cap_hit_content(3)}
            </table>
          </TabPanel>
          <TabPanel>
            <table className="content-table">
              {render_total_cap_hit_header('2026-2027')}
              {render_total_cap_hit_content(4)}
            </table>
          </TabPanel>
        </Tabs>
        <Tabs selectedIndex={selectedParticipantIndex} onSelect={index => setUserTab(index)}>
          <TabList>
            {poolInfo.participants.map(pooler => (
              <Tab key={pooler}>
                <User id={pooler} user={user} DictUsers={DictUsers} />
              </Tab>
            ))}
          </TabList>
          {poolInfo.participants.map(participant => (
            <TabPanel key={participant}>
              <div className="cont">
                <table className="content-table">
                  {render_roster_with_cap_hit_header('Forwards')}
                  {render_roster_with_cap_hit_content(
                    poolInfo.context.pooler_roster[participant].chosen_forwards.concat(
                      poolInfo.context.pooler_roster[participant].chosen_reservists
                    ),
                    'F',
                    participant
                  )}
                </table>
                <table className="content-table">
                  {render_roster_with_cap_hit_header('Defenders')}
                  {render_roster_with_cap_hit_content(
                    poolInfo.context.pooler_roster[participant].chosen_defenders.concat(
                      poolInfo.context.pooler_roster[participant].chosen_reservists
                    ),
                    'D',
                    participant
                  )}
                </table>
                <table className="content-table">
                  {render_roster_with_cap_hit_header('Goalies')}
                  {render_roster_with_cap_hit_content(
                    poolInfo.context.pooler_roster[participant].chosen_goalies.concat(
                      poolInfo.context.pooler_roster[participant].chosen_reservists
                    ),
                    'G',
                    participant
                  )}
                </table>
              </div>
            </TabPanel>
          ))}
        </Tabs>
      </div>
    );
  }

  return <ClipLoader color="#fff" loading size={75} />;
}
