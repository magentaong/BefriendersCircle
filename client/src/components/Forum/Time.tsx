import React from "react";
import type { TimestampQuery } from "three";

interface TimeProps {
  time: string;
}

const Time = ({time} : TimeProps ) => {

    let formattedDate = new Date(time).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    });

    formattedDate = formattedDate.replace('AM', 'am').replace('PM', 'pm');
  return (
    <span>{formattedDate}</span>
  );
};

export default Time;