import { Site as CommonSite, Status as CommonStatus, SeenStatus } from '@home-visit/common';
import { Site } from '../../entities/Site';
import { Status } from '../../entities/Status';

export class SiteMapper {
  static mapToCommonSite(site: Site): CommonSite {
    return {
      siteId: site.siteId,
      siteName: site.siteName,
      siteDisplayName: site.siteDisplayName,
      group: {
        groupId: site.group.groupId,
        groupName: site.group.groupName,
        groupDisplayName: site.group.groupDisplayName,
        groupDefaultRefreshSeconds: site.group.groupDefaultRefreshSeconds,
      },
      user: {
        userId: site.user.userId,
        username: site.user.username,
        userDisplayName: site.user.userDisplayName,
        group: {
          groupId: site.user.group.groupId,
          groupName: site.user.group.groupName,
          groupDisplayName: site.user.group.groupDisplayName,
          groupDefaultRefreshSeconds: site.user.group.groupDefaultRefreshSeconds,
        },
      },
      refreshSeconds: site.refreshSeconds,
      geometry: typeof site.geometry === 'string' ? site.geometry : (site.geometry ? String(site.geometry) : null),
    };
  }

  static mapToCommonStatus(status: Status): CommonStatus {
    return {
      statusId: status.statusId,
      siteId: status.siteId,
      seenStatus: status.seenStatus as SeenStatus,
      time: status.time,
      windowStartTime: status.windowStartTime,
    };
  }
}

