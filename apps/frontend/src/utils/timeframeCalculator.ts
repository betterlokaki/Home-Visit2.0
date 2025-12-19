function calculateAnchorDate(timestamp: Date): Date {
  const anchor = new Date(timestamp);
  anchor.setHours(0, 0, 0, 0);
  return anchor;
}

function calculateWindowStartTime(timestamp: Date, refreshSeconds: number): Date {
  if (refreshSeconds < 86400 && refreshSeconds % 60 !== 0) {
    throw new Error(`refresh_seconds must be a multiple of 60 for minute-based intervals`);
  }

  const anchor = calculateAnchorDate(timestamp);
  const secondsSinceAnchor = Math.floor((timestamp.getTime() - anchor.getTime()) / 1000);
  const windowNumber = Math.floor(secondsSinceAnchor / refreshSeconds);
  const windowStartSeconds = windowNumber * refreshSeconds;
  return new Date(anchor.getTime() + windowStartSeconds * 1000);
}

export function getCurrentWindowStart(refreshSeconds: number): Date {
  const now = new Date();
  return calculateWindowStartTime(now, refreshSeconds);
}

function getNaturalStartForWeek(windowStart: Date): Date {
  const naturalStart = new Date(windowStart);
  naturalStart.setHours(0, 0, 0, 0);
  const dayOfWeek = naturalStart.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  naturalStart.setDate(naturalStart.getDate() - daysToSubtract);
  return naturalStart;
}

function getNaturalStartForMonth(windowStart: Date): Date {
  const naturalStart = new Date(windowStart);
  naturalStart.setDate(1);
  naturalStart.setHours(0, 0, 0, 0);
  return naturalStart;
}


export function navigateTimeframe(
  currentWindowStart: Date,
  direction: 'prev' | 'next',
  refreshSeconds: number
): Date {
  const WEEK_SECONDS = 604800;
  const DAY_SECONDS = 86400;
  const MONTH_APPROX_SECONDS = 2592000;
  const currentWindowStartNow = getCurrentWindowStart(refreshSeconds);

  if (refreshSeconds === WEEK_SECONDS) {
    const currentWeekStart = getNaturalStartForWeek(currentWindowStart);
    if (direction === 'next') {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);
      if (nextWeekStart > currentWindowStartNow) {
        return currentWindowStart;
      }
      return nextWeekStart;
    } else {
      const prevWeekStart = new Date(currentWeekStart);
      prevWeekStart.setDate(currentWeekStart.getDate() - 7);
      return prevWeekStart;
    }
  }

  if (refreshSeconds > DAY_SECONDS && refreshSeconds <= MONTH_APPROX_SECONDS) {
    const currentMonthStart = getNaturalStartForMonth(currentWindowStart);
    if (direction === 'next') {
      const nextMonthStart = new Date(currentMonthStart);
      nextMonthStart.setMonth(currentMonthStart.getMonth() + 1);
      if (nextMonthStart > currentWindowStartNow) {
        return currentWindowStart;
      }
      return nextMonthStart;
    } else {
      const prevMonthStart = new Date(currentMonthStart);
      prevMonthStart.setMonth(currentMonthStart.getMonth() - 1);
      return prevMonthStart;
    }
  }

  if (refreshSeconds === DAY_SECONDS) {
    if (direction === 'next') {
      const nextDayStart = new Date(currentWindowStart);
      nextDayStart.setDate(currentWindowStart.getDate() + 1);
      nextDayStart.setHours(0, 0, 0, 0);
      if (nextDayStart > currentWindowStartNow) {
        return currentWindowStart;
      }
      return nextDayStart;
    } else {
      const prevDayStart = new Date(currentWindowStart);
      prevDayStart.setDate(currentWindowStart.getDate() - 1);
      prevDayStart.setHours(0, 0, 0, 0);
      return prevDayStart;
    }
  }

  if (direction === 'next') {
    const nextWindowStart = new Date(currentWindowStart.getTime() + refreshSeconds * 1000);
    if (nextWindowStart > currentWindowStartNow) {
      return currentWindowStart;
    }
    return nextWindowStart;
  } else {
    const prevWindowStart = new Date(currentWindowStart.getTime() - refreshSeconds * 1000);
    return prevWindowStart;
  }
}

export function calculateStartTime(windowStart: Date, _refreshSeconds: number): Date {
  return windowStart;
}

export function calculateEndTime(windowStart: Date, refreshSeconds: number): Date {
  return new Date(windowStart.getTime() + refreshSeconds * 1000 - 1);
}
