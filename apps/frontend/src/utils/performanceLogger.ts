import { logger } from './logger';

export class PerformanceLogger {
  private static markStart(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  private static markEnd(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-end`);
    }
  }

  private static measure(name: string): number | null {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch {
        return null;
      }
    }
    return null;
  }

  static logPageLoad(): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          logger.info('Page load performance', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          });
        }
      });
    }
  }

  static startApiCall(name: string): void {
    this.markStart(`api-${name}`);
  }

  static endApiCall(name: string, success: boolean): void {
    this.markEnd(`api-${name}`);
    const duration = this.measure(`api-${name}`);
    if (duration !== null) {
      logger.info('API call performance', {
        endpoint: name,
        duration,
        success,
      });
    }
  }

  static logRenderTime(componentName: string, renderTime: number): void {
    logger.debug('Component render time', {
      component: componentName,
      renderTime,
    });
  }
}

