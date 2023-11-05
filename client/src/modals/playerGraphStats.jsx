// This modals pops up when a user ask to generate a player specific graph into the inProgressPool.jsx files.
// It uses the score_by_day members to display a graph with x axis being the date and y axis begin the cummulate value
// (total_pts, total forwars point, etc...)

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

export default function PlayerGraphStats({ poolInfo, participant, player, DictUsers }) {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  // TODO: Add the hability of cumulating pool points from settings.
  const get_stats_value = statsInfo => {
    const [position, keyStats] = statsInfo;

    switch (player.position) {
      case 'All':
      case 'F':
      case 'D':
        return 0;
      case 'G':
        return 0;
      default:
        return null;
    }
  };

  const update_graph_stats = keyStats => {
    const startDate = new Date(poolInfo.season_start);
    const endDate = new Date(poolInfo.season_end);
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

    const color = 'red';

    const datasets = [];
    const labels = [];
    const cumulativePlayerData = [];
    let cumulateStats = 0;

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);

      if (poolInfo.context.score_by_day && poolInfo.context.score_by_day[jDate]) {
        labels.push(jDate);
        const dailyRoster = poolInfo.context.score_by_day[jDate][participant].roster[player.position];
        if (player.id in dailyRoster) {
          if (dailyRoster[player.id]) {
            cumulateStats += dailyRoster[player.id][keyStats];
          }
          cumulativePlayerData.push(cumulateStats);
        } else {
          cumulativePlayerData.push(null);
        }
      }
    }

    // Cumulate the array
    const dataset = {
      label: `${keyStats}`,
      data: cumulativePlayerData,
      backgroundColor: color,
      borderColor: color,
      tension: 0.4,
    };
    datasets.push(dataset);

    setChartData({
      labels,
      datasets,
    });
  };

  useEffect(() => {
    update_graph_stats('G'); // By Default use P (for total points)

    setChartOptions({
      color: 'white',
      responsive: true,
      title: {
        display: true,
        text: `${player.name} yearly cumulated points for ${participant}`,
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
            text: 'Cumulate',
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
  }, [player]);

  const on_stats_selection = event => {
    update_graph_stats(event.target.value);
  };

  if (chartData && chartOptions) {
    return (
      <div className="cont-max-width">
        <h1>
          {player.name} points cumulated for {DictUsers ? `${DictUsers[participant]}` : participant}
        </h1>
        <div>
          <select name="Cumulative Stats Selection" onChange={on_stats_selection}>
            {player.position === 'F' || player.position === 'D' ? (
              <>
                <option value="G">Goals</option>
                <option value="A">Assists</option>
                <option value="SOG">Shoot Out Goals</option>
              </>
            ) : (
              <>
                <option value="W">Wins</option>
                <option value="SO">Shutouts</option>
                <option value="G">Goals</option>
                <option value="A">Assists</option>
                <option value="OT">Overtimes</option>
              </>
            )}
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
