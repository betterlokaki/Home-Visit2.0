import { Request, Response } from 'express';
import { ISitesService } from '../../services/sites/interfaces/ISitesService';
import { SeenStatus, CoverStatus } from '@home-visit/common';

export class SitesController {
  constructor(private readonly sitesService: ISitesService) {}

  async getSitesByFilters(req: Request, res: Response): Promise<void> {
    const filter = req.body;

    if (!filter.group) {
      res.status(400).json({ error: 'group is required' });
      return;
    }

    if (filter.dates) {
      const fromDate = new Date(filter.dates.From);
      const toDate = new Date(filter.dates.To);

      if (isNaN(fromDate.getTime())) {
        res.status(400).json({ error: 'dates.From must be a valid date' });
        return;
      }

      if (isNaN(toDate.getTime())) {
        res.status(400).json({ error: 'dates.To must be a valid date' });
        return;
      }

      filter.dates.From = fromDate;
      filter.dates.To = toDate;
    }

    if (filter.coverStatus) {
      if (!Array.isArray(filter.coverStatus)) {
        res.status(400).json({ error: 'coverStatus must be an array' });
        return;
      }

      const validCoverStatuses: CoverStatus[] = [CoverStatus.Full, CoverStatus.Partial, CoverStatus.Empty];
      const invalidStatuses = filter.coverStatus.filter(
        (status: CoverStatus) => !validCoverStatuses.includes(status)
      );

      if (invalidStatuses.length > 0) {
        res.status(400).json({
          error: `coverStatus must be one of: ${validCoverStatuses.join(', ')}`,
        });
        return;
      }
    }

    const sites = await this.sitesService.getSitesByFilters(filter);
    res.json(sites);
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const { siteName, date, seenStatus } = req.body;

    if (!siteName) {
      res.status(400).json({ error: 'siteName is required' });
      return;
    }

    if (!date) {
      res.status(400).json({ error: 'date is required' });
      return;
    }

    if (!seenStatus) {
      res.status(400).json({ error: 'seenStatus is required' });
      return;
    }

    const validSeenStatuses: SeenStatus[] = [SeenStatus.Seen, SeenStatus.PartialSeen, SeenStatus.CoverNotSatisfied, SeenStatus.NotSeen];
    if (!validSeenStatuses.includes(seenStatus)) {
      res.status(400).json({ error: 'seenStatus must be one of: Seen, Partial Seen, Cover Not Satisfied, Not Seen' });
      return;
    }

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: 'date must be a valid date' });
        return;
      }

      const status = await this.sitesService.updateStatus(siteName, dateObj, seenStatus as SeenStatus);
      res.json(status);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      throw error;
    }
  }
}

