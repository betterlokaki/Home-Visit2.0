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

function getNaturalStartForWeek(endTime: Date): Date {
  const naturalStart = new Date(endTime);
  naturalStart.setHours(0, 0, 0, 0);
  const dayOfWeek = naturalStart.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  naturalStart.setDate(naturalStart.getDate() - daysToSubtract);
  return naturalStart;
}

function getNaturalStartForMonth(endTime: Date): Date {
  const naturalStart = new Date(endTime);
  naturalStart.setDate(1);
  naturalStart.setHours(0, 0, 0, 0);
  return naturalStart;
}

function getNaturalStartForDay(endTime: Date): Date {
  const naturalStart = new Date(endTime);
  naturalStart.setHours(0, 0, 0, 0);
  return naturalStart;
}

function getNaturalStart(endTime: Date, refreshSeconds: number): Date {
  const WEEK_SECONDS = 604800;
  const DAY_SECONDS = 86400;

  if (refreshSeconds === WEEK_SECONDS) {
    return getNaturalStartForWeek(endTime);
  }

  if (refreshSeconds === DAY_SECONDS) {
    return getNaturalStartForDay(endTime);
  }

  if (refreshSeconds > DAY_SECONDS) {
    return getNaturalStartForMonth(endTime);
  }

  return calculateWindowStartTime(endTime, refreshSeconds);
}

export function calculateStartTime(endTime: Date, refreshSeconds: number): Date {
  const calculatedStart = new Date(endTime.getTime() - refreshSeconds * 1000);
  const naturalStart = getNaturalStart(endTime, refreshSeconds);
  return calculatedStart > naturalStart ? calculatedStart : naturalStart;
}

function getSaturdayEndOfWeek(sundayStart: Date): Date {
  const saturdayEnd = new Date(sundayStart);
  saturdayEnd.setDate(sundayStart.getDate() + 6);
  saturdayEnd.setHours(23, 59, 59, 999);
  return saturdayEnd;
}

function getLastDayOfMonth(monthStart: Date): Date {
  const lastDay = new Date(monthStart);
  lastDay.setMonth(monthStart.getMonth() + 1);
  lastDay.setDate(0);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
}

export function navigateTimeframe(
  currentEndTime: Date,
  direction: 'prev' | 'next',
  refreshSeconds: number
): Date {
  const WEEK_SECONDS = 604800;
  const DAY_SECONDS = 86400;
  const MONTH_APPROX_SECONDS = 2592000;

  if (refreshSeconds === WEEK_SECONDS) {
    const currentWeekStart = getNaturalStartForWeek(currentEndTime);
    if (direction === 'next') {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);
      return getSaturdayEndOfWeek(nextWeekStart);
    } else {
      const prevWeekStart = new Date(currentWeekStart);
      prevWeekStart.setDate(currentWeekStart.getDate() - 7);
      return getSaturdayEndOfWeek(prevWeekStart);
    }
  }

  if (refreshSeconds > DAY_SECONDS && refreshSeconds <= MONTH_APPROX_SECONDS) {
    const currentMonthStart = getNaturalStartForMonth(currentEndTime);
    if (direction === 'next') {
      const nextMonthStart = new Date(currentMonthStart);
      nextMonthStart.setMonth(currentMonthStart.getMonth() + 1);
      return getLastDayOfMonth(nextMonthStart);
    } else {
      const prevMonthStart = new Date(currentMonthStart);
      prevMonthStart.setMonth(currentMonthStart.getMonth() - 1);
      return getLastDayOfMonth(prevMonthStart);
    }
  }

  if (refreshSeconds === DAY_SECONDS) {
    if (direction === 'next') {
      const nextDay = new Date(currentEndTime);
      nextDay.setDate(currentEndTime.getDate() + 1);
      nextDay.setHours(23, 59, 59, 999);
      return nextDay;
    } else {
      const prevDay = new Date(currentEndTime);
      prevDay.setDate(currentEndTime.getDate() - 1);
      prevDay.setHours(23, 59, 59, 999);
      return prevDay;
    }
  }

  const windowStart = calculateWindowStartTime(currentEndTime, refreshSeconds);
  const currentWindowEnd = new Date(windowStart.getTime() + refreshSeconds * 1000);
  
  if (direction === 'next') {
    return new Date(currentWindowEnd.getTime() + refreshSeconds * 1000);
  } else {
    if (currentEndTime.getTime() === windowStart.getTime()) {
      return new Date(windowStart.getTime() - refreshSeconds * 1000);
    } else {
      return windowStart;
    }
  }
}

