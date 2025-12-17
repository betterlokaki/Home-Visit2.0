import { Request, Response } from 'express';
import { IUsersService } from '../../services/users/interfaces/IUsersService';

export class UsersController {
  constructor(private readonly usersService: IUsersService) {}

  async getUsersByGroup(req: Request, res: Response): Promise<void> {
    const groupName = req.query.group as string;

    if (!groupName) {
      res.status(400).json({ error: 'group parameter is required' });
      return;
    }

    const users = await this.usersService.getUsersByGroupName(groupName);
    res.json(users);
  }

  async getUserByUsername(req: Request, res: Response): Promise<void> {
    const username = req.query.username as string;

    if (!username) {
      res.status(400).json({ error: 'username parameter is required' });
      return;
    }

    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  }
}

