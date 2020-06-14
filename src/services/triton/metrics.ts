import Entity from 'services/Entity';
import { TRITON_URL_PREFIX, fetchApi, getAuthorization } from './config';

export interface MetricLink {
  type: string;
  text: string;
  url: string;
}

export interface MetricEntity extends Entity {
  name: string;
  label: string;
  description: string;
  links: MetricLink[];
}

export const query = () => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/metrics`;

  return fetchApi(url, options);
};

export const get = metricId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/metrics/${metricId}`;

  return fetchApi(url, options);
};
