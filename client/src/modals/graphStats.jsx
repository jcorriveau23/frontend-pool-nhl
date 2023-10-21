// This modals pops up when a user ask to generate a graph into the inProgressPool.jsx files.
// It uses the score_by_day members to display a graph with x axis being the date and y axis begin the cummulate value (total_pts, total forwars point, etc...)

import React, { useEffect, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

// css
import './modal.css';

// chart
import {
  Chart,
  Title,
  Tooltip,
  LineElement,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(Title, Tooltip, LineElement, Legend, CategoryScale, LinearScale, PointElement, TimeScale);

export default function GraphStats({ poolInfo, DictUsers }) {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  const get_stats_value = (roster, statsInfo) => {
    const [position, keyStats] = statsInfo;

    let total_stats = 0;

    switch (position) {
      case 'All':
        return (
          get_stats_value(roster, ['F', 'TOT']) +
          get_stats_value(roster, ['D', 'TOT']) +
          get_stats_value(roster, ['G', 'TOT'])
        );
      case 'F': {
        for (const [player_id, stats] of Object.entries(roster.F)) {
          if (stats) {
            if (keyStats === 'G' || keyStats === 'TOT') {
              total_stats += stats.G * poolInfo.settings.forward_pts_goals;
            }
            if (keyStats === 'A' || keyStats === 'TOT') {
              total_stats += stats.A * poolInfo.settings.forward_pts_assists;
            }
            if (keyStats === 'HT' || keyStats === 'TOT') {
              if (stats.G >= 3) {
                total_stats += poolInfo.settings.forward_pts_hattricks;
              }
            }
            if (keyStats === 'SOG' || keyStats === 'TOT') {
              if (stats.SOG) {
                total_stats += stats.SOG * poolInfo.settings.forward_pts_shootout_goals;
              }
            }
          }
        }
        return total_stats;
      }
      case 'D':
        for (const [player_id, stats] of Object.entries(roster.D)) {
          if (stats) {
            if (keyStats === 'G' || keyStats === 'TOT') {
              total_stats += stats.G * poolInfo.settings.defender_pts_goals;
            }
            if (keyStats === 'A' || keyStats === 'TOT') {
              total_stats += stats.A * poolInfo.settings.defender_pts_assists;
            }
            if (keyStats === 'HT' || keyStats === 'TOT') {
              if (stats.G >= 3) {
                total_stats += poolInfo.settings.defender_pts_hattricks;
              }
            }
            if (keyStats === 'SOG' || keyStats === 'TOT') {
              if (stats.SOG) {
                total_stats += stats.SOG * poolInfo.settings.defender_pts_shootout_goals;
              }
            }
          }
        }
        return total_stats;
      case 'G':
        for (const [player_id, stats] of Object.entries(roster.G)) {
          if (stats) {
            if (keyStats === 'G' || keyStats === 'TOT') {
              total_stats += stats.G * poolInfo.settings.goalies_pts_goals;
            }
            if (keyStats === 'A' || keyStats === 'TOT') {
              total_stats += stats.A * poolInfo.settings.goalies_pts_assists;
            }
            if (keyStats === 'OT' || keyStats === 'TOT') {
              if (stats.OT) {
                total_stats += poolInfo.settings.goalies_pts_overtimes;
              }
            }
            if (keyStats === 'W' || keyStats === 'TOT') {
              if (stats.W) {
                total_stats += poolInfo.settings.goalies_pts_wins;
              }
            }
            if (keyStats === 'SO' || keyStats === 'TOT') {
              if (stats.SO) {
                total_stats += poolInfo.settings.goalies_pts_shutouts;
              }
            }
          }
        }
        return total_stats;
      default:
        return null;
    }
  };

  const update_graph_stats = stats => {
    const startDate = new Date(poolInfo.season_start);
    const endDate = new Date(poolInfo.season_end);
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

    const labels = [];

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);
      if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[jDate]) {
        labels.push(jDate);
      }
    }

    const color = ['red', 'blue', 'orange', 'green', 'pink', 'purple', 'yellow'];

    const datasets = [];
    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      // Cumulate the array
      const cumulativeArray = [];
      let cumulate = 0;
      for (let j = 0; j < labels.length; j += 1) {
        const date = labels[j];
        if (poolInfo.context.score_by_day[date][participant].roster) {
          const val = get_stats_value(poolInfo.context.score_by_day[date][participant].roster, stats);
          cumulate += val;
          cumulativeArray.push(cumulate);
        } else {
          cumulativeArray.push(null);
        }
      }

      const dataset = {
        label: DictUsers ? DictUsers[participant] : participant,
        data: cumulativeArray,
        backgroundColor: color[i % poolInfo.participants.length],
        borderColor: color[i % poolInfo.participants.length],
        tension: 0.4,
      };
      datasets.push(dataset);
    }

    setChartData({
      labels,
      datasets,
    });
  };

  useEffect(() => {
    update_graph_stats(['All', 'TOT']); // By Default use P (for total points)

    setChartOptions({
      color: 'white',
      responsive: true,
      title: {
        display: true,
        text: 'Points Cumulate Per Pooler by Date',
      },
      tooltips: {
        mode: 'label',
        titleFont: { size: 75 },
        bodyFont: { size: 60 },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      scales: {
        x: {
          grid: { color: 'white' },
          ticks: { color: 'white', font: { size: 20 } },
          title: {
            display: true,
            text: 'Date',
            color: 'white',
            font: {
              size: 30,
            },
          },
        },
        y: {
          grid: { color: 'white' },
          ticks: { color: 'white', font: { size: 20 } },
          title: {
            display: true,
            text: 'Points Cumulate',
            color: 'white',
            font: {
              size: 30,
            },
          },
        },
      },
      labels: {
        color: 'white',
        font: {
          size: 30,
        },
      },
      plugins: {
        legend: {
          labels: {
            // This more specific font property overrides the global property
            font: { size: 30, color: 'white' },
          },
        },
      },
    });
  }, []);

  const on_stats_selection = event => {
    update_graph_stats(event.target.value.split(','));
  };

  if (chartData && chartOptions) {
    return (
      <div className="cont-max-width">
        <h1>Pool Cumulative Stats</h1>
        <div>
          <select name="Cumulative Stats Selection" onChange={on_stats_selection}>
            <option value={['All', 'TOT']}>Total Points</option>
            <option value={['F', 'TOT']}>Total Forwards Points</option>
            <option value={['D', 'TOT']}>Total Defenders Points</option>
            <option value={['G', 'TOT']}>Total Goalies Points</option>
            <option value={['F', 'G']}>Goals Forwards</option>
            <option value={['F', 'A']}>Assists Forwards</option>
            <option value={['F', 'HT']}>Hat Tricks Forwards</option>
            <option value={['F', 'SOG']}>Shoot Out Goals Forwards</option>
            <option value={['D', 'G']}>Goals Defenders</option>
            <option value={['D', 'A']}>Assists Defenders</option>
            <option value={['D', 'HT']}>Hat Tricks Defenders</option>
            <option value={['D', 'SOG']}>Shoot Out Goals Defenders</option>
            <option value={['G', 'W']}>Wins Goalies</option>
            <option value={['G', 'SO']}>Shutouts Goalies</option>
            <option value={['G', 'G']}>Goals Goalies</option>
            <option value={['G', 'A']}>Assists Goalies</option>
            <option value={['G', 'OT']}>Overtimes lost</option>
          </select>
        </div>
        <div>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    );
  }

  return (
    <div className="cont">
      <h1>Trying to process the Stats Graph...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
