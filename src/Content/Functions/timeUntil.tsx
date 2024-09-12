/*
    CONVERT TIMESTAMP TO TIME UNTIL STRING
*/

const timeUntil = (timestamp: string | undefined, t: (key: string, options?: { count?: number }) => string): string => {
  const UTCDate = new Date();
  const now = new Date(UTCDate.getTime() + UTCDate.getTimezoneOffset() * 60000);

  const past = timestamp !== undefined ? new Date(timestamp) : new Date();
  const diff = past.getTime() - now.getTime();

  const seconds = diff / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  const weeks = days / 7
  const months = days / 30

  if (seconds < 60) {
    const sec = Math.floor(seconds);
    return t('timeUntil.seconds', { count: sec });
  } else if (minutes < 60) {
    const min = Math.floor(minutes);
    return t('timeUntil.minutes', { count: min });
  } else if (hours < 24) {
    const hr = Math.floor(hours);
    return t('timeUntil.hours', { count: hr });
  } else if (days < 7) {
    const day = Math.floor(days);
    return t('timeUntil.days', { count: day });
  } else if (weeks < 4) {
    const wk = Math.floor(weeks);
    return t('timeUntil.weeks', { count: wk });
  } else if (months < 12) {
    const mth = Math.floor(months);
    return t('timeUntil.months', { count: mth });
  } else {
    return t('timeUntil.years')
  }
}

export default timeUntil;
