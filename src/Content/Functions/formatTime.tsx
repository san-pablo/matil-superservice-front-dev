/*
  CONVERT THE NUMBER OF SECONDS IN A READABLE STRING (HH:MM:SS)
*/

const formatTime = (seconds: number, t: (key: string, options?: { count?: number }) => string): string => {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let timeParts: string[] = [];

  if (hours > 0) timeParts.push(t('formatTime.hours', { count: hours }));
  if (minutes > 0) timeParts.push(t('formatTime.minutes', { count: minutes }));
  if (seconds > 0) timeParts.push(t('formatTime.seconds', { count: seconds }));

  return timeParts.join(' y ');
}

export default formatTime;

