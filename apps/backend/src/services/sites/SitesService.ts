import { Site as CommonSite, SeenStatus, Status as CommonStatus, CoverStatus } from '@home-visit/common';
import { Status } from '../../entities/Status';
import { ISiteRepository } from '../../repositories/sites/interfaces/ISiteRepository';
import { ISitesService, SitesFilterRequest } from './interfaces/ISitesService';
import { SiteMapper } from './SiteMapper';
import { WindowCalculator } from './WindowCalculator';
import { ICoverStatusAndLinkService } from '../coverStatusAndLink/interfaces/ICoverStatusAndLinkService';

export class SitesService implements ISitesService {
  constructor(
    private readonly siteRepository: ISiteRepository,
    private readonly coverStatusAndLinkService: ICoverStatusAndLinkService
  ) {}

  async getSitesByFilters(filter: SitesFilterRequest): Promise<CommonSite[]> {
    if (filter.dates) {
      return await this.getSitesWithDateRange(filter);
    } else {
      return await this.getSitesWithLastWindow(filter);
    }
  }

  private async getSitesWithDateRange(filter: SitesFilterRequest): Promise<CommonSite[]> {
    const sites = await this.siteRepository.findByFilters({
      groupName: filter.group,
      usernames: filter.usernames,
      dateFrom: filter.dates!.From,
      dateTo: filter.dates!.To,
    });

    const sitesWithGeometry = sites.filter((site) => site.geometry !== null);
    const sitesWithoutGeometry = sites.filter((site) => site.geometry === null);

    const sitesWithStatus: Array<{ site: CommonSite; entity: typeof sitesWithGeometry[0] }> = [];
    for (const site of sitesWithGeometry) {
      const commonSite = SiteMapper.mapToCommonSite(site);
      const refreshSeconds = site.refreshSeconds ?? site.group.groupDefaultRefreshSeconds;
      const windowStartTime = WindowCalculator.calculateWindowStartTime(
        filter.dates!.To,
        refreshSeconds
      );

      const status = await this.siteRepository.findStatusBySiteIdAndWindowStartTime(
        site.siteId,
        windowStartTime
      );

      if (status) {
        commonSite.status = SiteMapper.mapToCommonStatus(status);
      } else {
        commonSite.status = {
          statusId: 0,
          siteId: site.siteId,
          seenStatus: SeenStatus.NotSeen,
          time: filter.dates!.To,
          windowStartTime: windowStartTime,
        };
      }

      // Collect all sites first, filter later with OR logic
      sitesWithStatus.push({ site: commonSite, entity: site });
    }

    const sitesWithoutGeometryResult: CommonSite[] = sitesWithoutGeometry.map((site) => {
      const commonSite = SiteMapper.mapToCommonSite(site);
      const refreshSeconds = site.refreshSeconds ?? site.group.groupDefaultRefreshSeconds;
      const windowStartTime = WindowCalculator.calculateWindowStartTime(
        filter.dates!.To,
        refreshSeconds
      );
      commonSite.status = {
        statusId: 0,
        siteId: site.siteId,
        seenStatus: SeenStatus.NotSeen,
        time: filter.dates!.To,
        windowStartTime: windowStartTime,
      };
      return commonSite;
    });

    if (sitesWithStatus.length === 0 && sitesWithoutGeometryResult.length === 0) {
      return [];
    }

    const now = new Date();
    const minRefreshSeconds = Math.min(
      ...sitesWithStatus.map(({ entity }) => {
        return entity.refreshSeconds ?? entity.group.groupDefaultRefreshSeconds;
      })
    );
    const timeRange = {
      from: new Date(now.getTime() - minRefreshSeconds * 1000),
      to: now,
    };

    const coverStatusResults = await this.coverStatusAndLinkService.getCoverStatusAndLink(
      sitesWithStatus.map(({ entity }) => ({
        siteName: entity.siteName,
        geometry: entity.geometry!,
        refreshSeconds: entity.refreshSeconds ?? entity.group.groupDefaultRefreshSeconds,
      })),
      timeRange
    );

    const coverStatusMap = new Map(
      coverStatusResults.map((result) => [result.siteName, result])
    );

    const result: CommonSite[] = sitesWithStatus.map(({ site }) => {
      const coverStatusResult = coverStatusMap.get(site.siteName);
      if (coverStatusResult) {
        site.coverStatus = coverStatusResult.coverStatus;
        site.siteLink = coverStatusResult.siteLink;
      } else {
        site.coverStatus = 'no data available';
        site.siteLink = 'no data available';
      }
      return site;
    });

    // Add sites without geometry (they don't have coverStatus)
    for (const site of sitesWithoutGeometryResult) {
      site.coverStatus = 'no data available';
      site.siteLink = 'no data available';
      result.push(site);
    }

    // Apply OR logic filtering: include site if it matches status filter OR coverStatus filter
    // If no filters provided, return all sites
    const hasStatusFilter = filter.status && filter.status.length > 0;
    const hasCoverStatusFilter = filter.coverStatus && filter.coverStatus.length > 0;

    if (!hasStatusFilter && !hasCoverStatusFilter) {
      return result;
    }

    return result.filter((site) => {
      const matchesStatus = hasStatusFilter && 
        site.status && 
        filter.status!.includes(site.status.seenStatus as SeenStatus);
      
      const matchesCoverStatus = hasCoverStatusFilter && 
        site.coverStatus !== undefined &&
        filter.coverStatus!.some((filterStatus) => {
          // Treat "no data available" as "Empty" for filtering purposes
          if (filterStatus === CoverStatus.Empty) {
            return site.coverStatus === CoverStatus.Empty || site.coverStatus === 'no data available';
          }
          return filterStatus === site.coverStatus;
        });

      // OR logic: match if either status OR coverStatus matches (when both filters are provided)
      // If only one filter is provided, only that filter applies
      if (hasStatusFilter && hasCoverStatusFilter) {
        return matchesStatus || matchesCoverStatus;
      } else if (hasStatusFilter) {
        return matchesStatus;
      } else {
        return matchesCoverStatus;
      }
    });
  }

  private async getSitesWithLastWindow(filter: SitesFilterRequest): Promise<CommonSite[]> {
    const sites = await this.siteRepository.findByFilters({
      groupName: filter.group,
      usernames: filter.usernames,
    });

    const sitesWithGeometry = sites.filter((site) => site.geometry !== null);
    const sitesWithoutGeometry = sites.filter((site) => site.geometry === null);

    const now = new Date();
    const sitesWithStatus: Array<{ site: CommonSite; entity: typeof sites[0] }> = [];

    for (const site of sitesWithGeometry) {
      const refreshSeconds = site.refreshSeconds ?? site.group.groupDefaultRefreshSeconds;
      const windowStartTime = WindowCalculator.calculateWindowStartTime(now, refreshSeconds);

      let status = await this.siteRepository.findStatusBySiteIdAndWindowStartTime(
        site.siteId,
        windowStartTime
      );

      if (!status) {
        status = new Status();
        status.siteId = site.siteId;
        status.seenStatus = 'Not Seen';
        status.time = now;
        status.windowStartTime = windowStartTime;
        status = await this.siteRepository.saveStatus(status);
      }

      const commonSite = SiteMapper.mapToCommonSite(site);
      commonSite.status = SiteMapper.mapToCommonStatus(status);

      // Collect all sites first, filter later with OR logic
      sitesWithStatus.push({ site: commonSite, entity: site });
    }

    if (sitesWithStatus.length === 0) {
      return sitesWithoutGeometry.map((site) => SiteMapper.mapToCommonSite(site));
    }

    const minRefreshSeconds = Math.min(
      ...sitesWithStatus.map(({ entity }) => {
        return entity.refreshSeconds ?? entity.group.groupDefaultRefreshSeconds;
      })
    );
    const timeRange = {
      from: new Date(now.getTime() - minRefreshSeconds * 1000),
      to: now,
    };

    const coverStatusResults = await this.coverStatusAndLinkService.getCoverStatusAndLink(
      sitesWithStatus.map(({ entity }) => ({
        siteName: entity.siteName,
        geometry: entity.geometry!,
        refreshSeconds: entity.refreshSeconds ?? entity.group.groupDefaultRefreshSeconds,
      })),
      timeRange
    );

    const coverStatusMap = new Map(
      coverStatusResults.map((result) => [result.siteName, result])
    );

    const result: CommonSite[] = sitesWithStatus.map(({ site }) => {
      const coverStatusResult = coverStatusMap.get(site.siteName);
      if (coverStatusResult) {
        site.coverStatus = coverStatusResult.coverStatus;
        site.siteLink = coverStatusResult.siteLink;
      } else {
        site.coverStatus = 'no data available';
        site.siteLink = 'no data available';
      }
      return site;
    });

    // Apply OR logic filtering: include site if it matches status filter OR coverStatus filter
    // If no filters provided, return all sites
    const hasStatusFilter = filter.status && filter.status.length > 0;
    const hasCoverStatusFilter = filter.coverStatus && filter.coverStatus.length > 0;

    if (!hasStatusFilter && !hasCoverStatusFilter) {
      return result;
    }

    return result.filter((site) => {
      const matchesStatus = hasStatusFilter && 
        site.status && 
        filter.status!.includes(site.status.seenStatus as SeenStatus);
      
      const matchesCoverStatus = hasCoverStatusFilter && 
        site.coverStatus !== undefined &&
        filter.coverStatus!.some((filterStatus) => {
          // Treat "no data available" as "Empty" for filtering purposes
          if (filterStatus === CoverStatus.Empty) {
            return site.coverStatus === CoverStatus.Empty || site.coverStatus === 'no data available';
          }
          return filterStatus === site.coverStatus;
        });

      // OR logic: match if either status OR coverStatus matches (when both filters are provided)
      // If only one filter is provided, only that filter applies
      if (hasStatusFilter && hasCoverStatusFilter) {
        return matchesStatus || matchesCoverStatus;
      } else if (hasStatusFilter) {
        return matchesStatus;
      } else {
        return matchesCoverStatus;
      }
    });
  }

  async updateStatus(siteName: string, date: Date, seenStatus: SeenStatus): Promise<CommonStatus> {
    const site = await this.siteRepository.findBySiteName(siteName);
    if (!site) {
      throw new Error(`Site with name '${siteName}' not found`);
    }

    const refreshSeconds = site.refreshSeconds ?? site.group.groupDefaultRefreshSeconds;
    const windowStartTime = WindowCalculator.calculateWindowStartTime(date, refreshSeconds);

    let status = await this.siteRepository.findStatusBySiteIdAndWindowStartTime(
      site.siteId,
      windowStartTime
    );

    const now = new Date();
    if (status) {
      status.seenStatus = seenStatus;
      status.time = now;
    } else {
      status = new Status();
      status.siteId = site.siteId;
      status.seenStatus = seenStatus;
      status.time = now;
      status.windowStartTime = windowStartTime;
    }

    const savedStatus = await this.siteRepository.saveStatus(status);
    return SiteMapper.mapToCommonStatus(savedStatus);
  }

}

