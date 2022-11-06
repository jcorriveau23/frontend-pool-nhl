// import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';

// export default function PoolSettings({ poolInfo }) {
//   const [isModified, setIsModified] = useState(false);
//   useEffect(() => {
//     // Create a copy of the poolInfo containing only the settings properties

//     const poolInfoCopy = {
//       number_forwards: poolInfo.number_forwards, // Can only be updated (after the end season date)
//       number_defenders: poolInfo.number_defenders, // Can only be updated (after the end season date)
//       number_goalies: poolInfo.number_goalies, // Can only be updated (after the end season date)
//       number_reservists: poolInfo.number_reservists, // Can only be updated (after the end season date)
//       next_season_number_players_protected: poolInfo.next_season_number_players_protected, // Can only be updated (after the end season date)
//       tradable_picks: poolInfo.tradable_picks, // Can only be updated (after the end season date)

//       // Forwards Points:
//       forward_pts_goals: poolInfo.forward_pts_goals,
//       forward_pts_assists: poolInfo.forward_pts_assists,
//       forward_pts_hattricks: forward_pts_hattricks.number_forwards,
//       forward_pts_shootout_goals: poolInfo.forward_pts_shootout_goals,
//       // Defenders Points:
//       defender_pts_goals: poolInfo.number_forwards,
//       defender_pts_assists: poolInfo.number_forwards,
//       defender_pts_hattricks: poolInfo.number_forwards,
//       defender_pts_shootout_goals: poolInfo.number_forwards,
//       // Goalies Points:
//       goalies_pts_wins: poolInfo.number_forwards,
//       goalies_pts_shutouts: poolInfo.number_forwards,
//       goalies_pts_goals: poolInfo.number_forwards,
//       goalies_pts_assists: poolInfo.number_forwards,
//     };

//     console.log(poolInfoCopy);
//   }, []);

//   return (
//     <h1>
//       <div className="half-cont">
//         <h2>Rule: </h2>
//         <table>
//           <tbody>
//             <tr>
//               <td>Number of poolers</td>
//               <td>{poolInfo.number_poolers}</td>
//             </tr>
//             <tr>
//               <td>Number of forwards:</td>
//               <td>
//                 <select
//                   name="number_forwards"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.number_forwards}
//                 >
//                   <option>2</option>
//                   <option>3</option>
//                   <option>4</option>
//                   <option>5</option>
//                   <option>6</option>
//                   <option>7</option>
//                   <option>8</option>
//                   <option>9</option>
//                   <option>10</option>
//                   <option>11</option>
//                   <option>12</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>Number of defenders:</td>
//               <td>
//                 <select
//                   name="number_defenders"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.number_defenders}
//                 >
//                   <option>2</option>
//                   <option>3</option>
//                   <option>4</option>
//                   <option>5</option>
//                   <option>6</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>Number of goalies:</td>
//               <td>
//                 <select
//                   name="number_goalies"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.number_goalies}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>Number of reservists:</td>
//               <td>
//                 <select
//                   name="number_reservists"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.number_reservists}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                   <option>4</option>
//                   <option>5</option>
//                 </select>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//         <h2>Points</h2>
//         <table>
//           <tbody>
//             <tr>
//               <td>pts per goal by forward:</td>
//               <td>
//                 <select
//                   name="forward_pts_goals"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.forward_pts_goals}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per assist by forward:</td>
//               <td>
//                 <select
//                   name="forward_pts_assists"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.forward_pts_assists}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per hat trick by forward:</td>
//               <td>
//                 <select
//                   name="forward_pts_hattricks"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.forward_pts_hattricks}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per goal by defender:</td>
//               <td>
//                 <select
//                   name="defender_pts_goals"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.defender_pts_goals}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per assist by defender:</td>
//               <td>
//                 <select
//                   name="defender_pts_assists"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.defender_pts_assists}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per hat trick by defender:</td>
//               <td>
//                 <select
//                   name="defender_pts_hattricks"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.defender_pts_hattricks}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per win by goalies</td>
//               <td>
//                 <select
//                   name="goalies_pts_wins"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.goalies_pts_wins}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per shutout by goalies</td>
//               <td>
//                 <select
//                   name="goalies_pts_shutouts"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.goalies_pts_shutouts}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per goal by goalies:</td>
//               <td>
//                 <select
//                   name="goalies_pts_goals"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.goalies_pts_goals}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>pts per assist by goalies:</td>
//               <td>
//                 <select
//                   name="goalies_pts_assists"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.goalies_pts_assists}
//                 >
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>next season number player protected:</td>
//               <td>
//                 <select
//                   name="next_season_number_players_protected"
//                   onChange={handleChange}
//                   disabled={poolInfo.owner !== user._id.$oid}
//                   value={poolInfo.next_season_number_players_protected}
//                 >
//                   <option>6</option>
//                   <option>7</option>
//                   <option>8</option>
//                   <option>9</option>
//                   <option>10</option>
//                   <option>11</option>
//                   <option>12</option>
//                 </select>
//               </td>
//             </tr>
//             <tr>
//               <td>number tradable draft picks:</td>
//               <td>
//                 <select name="tradable_picks" onChange={handleChange} disabled={poolInfo.owner !== user._id.$oid}>
//                   <option>1</option>
//                   <option>2</option>
//                   <option>3</option>
//                   <option>4</option>
//                   <option>5</option>
//                 </select>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </h1>
//   );
// }
