import type { CoverStatus, SeenStatus } from '@home-visit/common';

export interface StatusDisplay {
  text: string;
  color: string;
}

export function getStatusDisplay(
  coverStatus: CoverStatus | 'no data available' | undefined,
  seenStatus: SeenStatus | undefined,
  isOpen: boolean
): StatusDisplay {
  // If card is open, show "Doing" status (blue)
  if (isOpen) {
    return {
      text: 'בביקור',
      color: 'blue',
    };
  }

  // If cover is empty or no data available
  if (!coverStatus || coverStatus === 'Empty' || coverStatus === 'no data available') {
     return {
      text: 'אין איסוף',
      color: 'red',
    };
  }

  // If no seen status, default to Not Seen
  const currentSeenStatus = seenStatus || 'Not Seen';

  // Handle Cover Not Satisfied status (works with any cover status except Empty)
  if (currentSeenStatus === 'Cover Not Satisfied') {
    return {
      text: 'איסוף לא מספק',
      color: 'purple',
    };
  }

  // Partial cover cases
  if (coverStatus === 'Partial') {
    if (currentSeenStatus === 'Partial Seen') {
      return {
        text: 'בוצע חלקית',
        color: 'orange',
      };
    }
    // Partial cover and Not Seen
    return {
      text: 'מחכה לביקור',
      color: 'yellow',
    };
  }

  // Full cover cases
  if (coverStatus === 'Full') {
    if (currentSeenStatus === 'Seen') {
      return {
        text: 'בוצע',
        color: 'green',
      };
    }
    if (currentSeenStatus === 'Partial Seen') {
      return {
        text: 'מחכה לביקור',
        color: 'orange',
      };
    }
    // Full cover and Not Seen
    return {
      text: 'מחכה לביקור',
      color: 'yellow',
    };
  }

  // Fallback (should not happen)
  return {
    text: 'מחכה לביקור',
    color: 'yellow',
  };
}

