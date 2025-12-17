import { Request, Response } from 'express';
import { IGroupsService } from '../../services/groups/interfaces/IGroupsService';

export class GroupsController {
  constructor(private readonly groupsService: IGroupsService) {}

  async getAllGroups(_req: Request, res: Response): Promise<void> {
    const groups = await this.groupsService.getAllGroups();
    res.json(groups);
  }
}

