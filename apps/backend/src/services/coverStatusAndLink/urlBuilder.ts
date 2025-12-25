import { AppConfig } from '../../config/configSchema';

export const resolveService1Url = (config: AppConfig): string => {
  const { endpoint, url } = config.service1;
  return endpoint.startsWith('http')
    ? endpoint
    : `${url}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

