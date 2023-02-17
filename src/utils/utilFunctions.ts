export const getIntervalString = (start: Date, end: Date) => {
  const startString = `${new Date(start).toLocaleTimeString()}`;
  const endString = `${new Date(end).toLocaleTimeString()}`;

  const cutMinutesFromTimeString = (timeString: string) =>
    `${timeString.slice(0, -3)}`;

  return `${cutMinutesFromTimeString(startString)} - ${cutMinutesFromTimeString(
    endString
  )}`;
};

export const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
