import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

export default function NaviguateToday({ formatDate, todayFormatDate, msg, colSpan }) {
  const [title, setTitle] = useState(`Today's ${msg}`);

  useEffect(() => {
    const newDate = new Date();

    if (newDate.getHours() < 12) {
      setTitle(`Yesterday's ${msg}`);
    }
  }, [formatDate]);

  if (todayFormatDate && formatDate) {
    return (
      <tr>
        {formatDate === todayFormatDate ? (
          <th colSpan={colSpan} style={{ color: '#090' }}>
            {title}
          </th>
        ) : (
          <th colSpan={colSpan} style={{ color: '#c20' }}>
            {msg} ({formatDate})
          </th>
        )}
      </tr>
    );
  }

  return (
    <tr>
      <th colSpan={colSpan}>
        <ClipLoader color="#fff" loading size={25} />
      </th>
    </tr>
  );
}
