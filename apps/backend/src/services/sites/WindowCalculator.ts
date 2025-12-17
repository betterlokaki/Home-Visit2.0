const ANCHOR_DATE = new Date('2025-01-12T00:00:00.000Z');

export class WindowCalculator {
  static calculateWindowStartTime(timestamp: Date, refreshSeconds: number): Date {
    const secondsSinceAnchor = Math.floor((timestamp.getTime() - ANCHOR_DATE.getTime()) / 1000);
    const windowNumber = Math.floor(secondsSinceAnchor / refreshSeconds);
    const windowStartSeconds = windowNumber * refreshSeconds;
    return new Date(ANCHOR_DATE.getTime() + windowStartSeconds * 1000);
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

