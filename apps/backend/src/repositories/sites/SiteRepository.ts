import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Site } from '../../entities/Site';
import { Status } from '../../entities/Status';
import { ISiteRepository, SiteFilterOptions } from './interfaces/ISiteRepository';

export class SiteRepository implements ISiteRepository {
  private getSiteRepository(): Repository<Site> {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database connection is not initialized');
    }
    return AppDataSource.getRepository(Site);
  }

  private getStatusRepository(): Repository<Status> {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database connection is not initialized');
    }
    return AppDataSource.getRepository(Status);
  }

  async findByFilters(options: SiteFilterOptions): Promise<Site[]> {
    const queryBuilder = this.getSiteRepository()
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.group', 'group')
      .leftJoinAndSelect('site.user', 'user')
      .leftJoinAndSelect('user.group', 'userGroup')
      .addSelect('ST_AsText(site.geometry)', 'geometry_wkt')
      .where('group.group_name = :groupName', { groupName: options.groupName });

    if (options.usernames && options.usernames.length > 0) {
      queryBuilder.andWhere('user.username IN (:...usernames)', { usernames: options.usernames });
    }

    // Always load statuses relation, but don't filter sites by date
    // Dates are used in the service layer to determine which status to show
    queryBuilder.leftJoinAndSelect('site.statuses', 'status');

    const results = await queryBuilder.getRawAndEntities();
    
    // Map raw results to entities with WKT geometry
    return results.entities.map((entity, index) => {
      const raw = results.raw[index];
      if (raw && raw.geometry_wkt) {
        entity.geometry = raw.geometry_wkt;
      }
      return entity;
    });
  }

  async findBySiteName(siteName: string): Promise<Site | null> {
    const site = await this.getSiteRepository().findOne({
      where: { siteName },
      relations: ['group'],
    });
    
    if (site && site.geometry) {
      // Convert geometry to WKT if needed
      const result = await this.getSiteRepository()
        .createQueryBuilder('site')
        .select('ST_AsText(site.geometry)', 'geometry_wkt')
        .where('site.site_name = :siteName', { siteName })
        .getRawOne();
      
      if (result && result.geometry_wkt) {
        site.geometry = result.geometry_wkt;
      }
    }
    
    return site;
  }

  async findStatusBySiteIdAndWindowStartTime(siteId: number, windowStartTime: Date): Promise<Status | null> {
    return await this.getStatusRepository().findOne({
      where: {
        siteId: siteId,
        windowStartTime: windowStartTime,
      },
    });
  }

  async saveStatus(status: Status): Promise<Status> {
    return await this.getStatusRepository().save(status);
  }
}

