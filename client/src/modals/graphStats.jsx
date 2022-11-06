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

export default function GraphStatsModal({ poolInfo, DictUsers }) {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  const update_graph_stats = keyStats => {
    const startDate = new Date(poolInfo.season_start);
    const endDate = new Date();

    endDate.setDate(endDate.getDate() + 1);

    const labels = [];

    for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
      const jDate = j.toISOString().slice(0, 10);
      if (poolInfo.context.score_by_day[jDate]) {
        labels.push(jDate);
      }
    }

    const color = ['red', 'blue', 'orange', 'green', 'pink', 'purple'];

    const datasets = [];
    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];
      const dataset = {
        label: DictUsers ? DictUsers[participant] : participant,
        data: labels.map(
          key =>
            poolInfo.context.score_by_day[key][participant].cumulate
              ? poolInfo.context.score_by_day[key][participant].cumulate[keyStats]
              : null // No cumulative data on that date. (Mostly no games has started yet)
        ),
        backgroundColor: color[i % poolInfo.participants.length],
        borderColor: color[i % poolInfo.participants.length],
        tension: 0.4,
        pointStyle: 'star',
        pointBorderColor: 'blue',
      };
      datasets.push(dataset);
    }

    console.log(labels);
    console.log(datasets);

    setChartData({
      labels,
      datasets,
    });
  };

  useEffect(() => {
    update_graph_stats('P'); // By Default use P (for total points)

    setChartOptions({
      color: 'white',
      responsive: true,
      title: {
        display: true,
        text: 'Points Cumulate Per Pooler by Date',
      },
      tooltips: {
        mode: 'label',
        titleFont: { size: 30 },
        bodyFont: { size: 22 },
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
    console.log(event.target.value);
    update_graph_stats(event.target.value);
  };
  if (chartData && chartOptions) {
    return (
      <div className="cont-max-width">
        <h1>Pool Cumulative Stats</h1>
        <div>
          <select name="Cumulative Stats Selection" onChange={on_stats_selection}>
            <option value="P">Total Points</option>
            <option value="P_F">Total Forwards Points</option>
            <option value="P_D">Total Defenders Points</option>
            <option value="P_G">Total Goalies Points</option>
            <option value="G_F">Goals Forwards</option>
            <option value="A_F">Assists Forwards</option>
            <option value="HT_F">Hat Tricks Forwards</option>
            <option value="SOG_F">Shoot Out Goals Forwards</option>
            <option value="G_D">Goals Defenders</option>
            <option value="A_D">Assists Defenders</option>
            <option value="HT_D">Hat Tricks Defenders</option>
            <option value="SOG_D">Shoot Out Goals Defenders</option>
            <option value="W_G">Wins Goalies</option>
            <option value="SO_G">Shutouts Goalies</option>
            <option value="G_G">Goals Goalies</option>
            <option value="A_G">Assists Goalies</option>
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
