import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import ReactTooltip from 'react-tooltip';
import { RiInformationFill } from 'react-icons/ri';

export default function NaviguateToday({ formatDate, todayFormatDate, msg, tooltipMsg, colSpan }) {
  const [title, setTitle] = useState(`Today's ${msg}`);

  const getToolTip = () =>
    tooltipMsg ? (
      <>
        <a style={{ textAlign: 'right' }} data-tip={tooltipMsg}>
          <RiInformationFill color="yellow" size={30} />
        </a>
        <ReactTooltip className="tooltip" padding="8px" />
      </>
    ) : null;

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
            {title} {getToolTip()}
          </th>
        ) : (
          <th colSpan={colSpan} style={{ color: '#c20' }}>
            {msg} ({formatDate}) {getToolTip()}
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
