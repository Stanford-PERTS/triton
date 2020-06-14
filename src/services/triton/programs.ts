import Entity from 'services/Entity';
import { TRITON_URL_PREFIX, fetchApi, getAuthorization } from './config';

export interface ProgramMetricConfig {
  uid: string;
  default_active: boolean;
}

export interface ProgramEntity extends Entity {
  active: boolean;
  label: string;
  max_cycles: number;
  max_team_members: number;
  metrics: ProgramMetricConfig[];
  min_cycles: number;
  name: string;
  preview_url: string;
  survey_config_enabled: boolean;
}

const negativeToInfinity = (x: number) => (x < 0 ? Infinity : x);

const translateInfinities = (sqlProgram: ProgramEntity): ProgramEntity => ({
  ...sqlProgram,
  max_cycles: negativeToInfinity(sqlProgram.max_cycles),
  max_team_members: negativeToInfinity(sqlProgram.max_team_members),
});

export const query = (): Promise<ProgramEntity[]> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/programs`;

  return fetchApi(url, options).then(programs =>
    programs.map(translateInfinities),
  );
};

export const get = (programId: string): Promise<ProgramEntity> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/programs/${programId}`;

  return fetchApi(url, options).then(translateInfinities);
};

export const search = (programLabel: string, query: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const encodedQ = encodeURIComponent(query);
  const url = `${TRITON_URL_PREFIX}/api/programs/${programLabel}/search?q=${encodedQ}`;

  return fetchApi(url, options);
};
