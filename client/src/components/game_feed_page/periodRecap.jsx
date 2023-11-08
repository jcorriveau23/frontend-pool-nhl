import React from 'react';

// component
import GoalItem from './goalItem';

// css
import './goalItem.css';

export default function PeriodRecap({ scoring }) {
  const render_period = period => (
    <>
      <thead>
        <tr>
          <th>{period.period === 4 ? 'OT' : `Period: ${period.period}`}</th>
        </tr>
      </thead>
      <tbody>
        {period.goals.map(goalData => (
          <tr>
            <td>
              <GoalItem goalData={goalData} />
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );

  return (
    <div>
      <table className="goal-item">{scoring.map(period => render_period(period))}</table>
    </div>
  );
}
