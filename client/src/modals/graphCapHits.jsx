// This modals pops up when a user ask to generate a graph into the roster.jsx files.
// It uses the object process in this file to show the cap hits by year in a graph for each poolers.

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

export default function GraphCapHits({ poolInfo, totalCapHitsByYears, DictUsers }) {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  const update_graph_stats = keyStats => {
    const labels = ['2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];

    const datasets = [];
    const color = ['red', 'blue', 'orange', 'green', 'pink', 'purple'];

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      const dataset = {
        label: DictUsers ? DictUsers[participant] : participant,
        data: totalCapHitsByYears.map(year => year[year.findIndex(total => total.name === participant)][keyStats]),
        backgroundColor: color[i % poolInfo.participants.length],
        borderColor: color[i % poolInfo.participants.length],
        tension: 0.4,
        pointStyle: 'star',
        pointBorderColor: 'blue',
      };
      datasets.push(dataset);
    }

    setChartData({
      labels,
      datasets,
    });
  };

  useEffect(() => {
    update_graph_stats('tot'); // By Default use P (for total points)

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
            text: 'Cap Hits (USD)',
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
    update_graph_stats(event.target.value);
  };

  if (chartData && chartOptions) {
    return (
      <div className="cont-max-width">
        <h1>Cap Hits by years</h1>
        <div>
          <select name="Cumulative Stats Selection" onChange={on_stats_selection}>
            <option value="tot">Total Cap Hits</option>
            <option value="F">Forwards Cap Hits</option>
            <option value="D">Defenders Cap Hits</option>
            <option value="G">Goalies Cap Hits</option>
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
      <h1>Trying to process the Cap Hits Graph...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
