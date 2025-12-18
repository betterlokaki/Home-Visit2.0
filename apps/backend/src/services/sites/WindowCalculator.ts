export class WindowCalculator {
  private static calculateAnchorDate(timestamp: Date): Date {
    const anchor = new Date(timestamp);
    anchor.setHours(0, 0, 0, 0);
    return anchor;
  }

  static calculateWindowStartTime(timestamp: Date, refreshSeconds: number): Date {
    if (refreshSeconds < 86400 && refreshSeconds % 60 !== 0) {
      throw new Error(`refresh_seconds must be a multiple of 60 for minute-based intervals`);
    }

    const anchor = this.calculateAnchorDate(timestamp);
    const secondsSinceAnchor = Math.floor((timestamp.getTime() - anchor.getTime()) / 1000);
    const windowNumber = Math.floor(secondsSinceAnchor / refreshSeconds);
    const windowStartSeconds = windowNumber * refreshSeconds;
    return new Date(anchor.getTime() + windowStartSeconds * 1000);
  }

  static getAllWindowStartTimes(dateFrom: Date, dateTo: Date, refreshSeconds: number): Date[] {
    const startWindow = this.calculateWindowStartTime(dateFrom, refreshSeconds);
    const endWindow = this.calculateWindowStartTime(dateTo, refreshSeconds);
    const windows: Date[] = [];
    let currentWindow = new Date(startWindow);

    while (currentWindow <= endWindow) {
      windows.push(new Date(currentWindow));
      currentWindow = new Date(currentWindow.getTime() + refreshSeconds * 1000);
    }

    return windows;
  }
}

