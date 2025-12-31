import { Request, Response, NextFunction } from 'express';

interface UserContext {
  username?: string;
  userId?: number;
}

interface GroupContext {
  groupName?: string;
  groupId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
      group?: GroupContext;
    }
  }
}

export const userContextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const username = req.headers['x-user-username'] as string | undefined;
  const userIdHeader = req.headers['x-user-id'] as string | undefined;
  const groupName = req.headers['x-group-name'] as string | undefined;
  const groupIdHeader = req.headers['x-group-id'] as string | undefined;

  if (username) {
    req.user = {
      username,
      userId: userIdHeader ? parseInt(userIdHeader, 10) : undefined,
    };
  }

  if (groupName) {
    req.group = {
      groupName,
      groupId: groupIdHeader ? parseInt(groupIdHeader, 10) : undefined,
    };
  }

  next();
};

