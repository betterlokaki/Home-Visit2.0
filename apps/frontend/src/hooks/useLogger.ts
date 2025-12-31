import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

export const useLogger = () => {
  const { user, group } = useAuth();

  const context = user || group
    ? {
        username: user?.username,
        userId: user?.userId,
        groupName: group?.groupName,
        groupId: group?.groupId,
      }
    : undefined;

  return {
    error: (message: string, metadata?: Record<string, unknown>): void =>
      logger.error(message, metadata, context),
    warn: (message: string, metadata?: Record<string, unknown>): void =>
      logger.warn(message, metadata, context),
    info: (message: string, metadata?: Record<string, unknown>): void =>
      logger.info(message, metadata, context),
    debug: (message: string, metadata?: Record<string, unknown>): void =>
      logger.debug(message, metadata, context),
    log: (message: string, metadata?: Record<string, unknown>): void =>
      logger.log(message, metadata, context),
  };
};

