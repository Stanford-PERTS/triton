/**
 * {
 *  uid: 'Cycle_0123456789ab',
 *  short_uid: '0123456789ab',
 *  team_id: 'Team_0123456789ab',
 *  ordinal: 1,
 *  start_date: 'YYYY-MM-DD',
 *  end_date: 'YYYY-MM-DD',
 *  extended_end_date: 'YYYY-MM-DD';
 *  meeting_date: 'YYYY-MM-DD',
 *  resolution_date: 'YYYY-MM-DD',
 * }
 */

import { Moment } from 'moment';

import Entity from 'services/Entity';
import {
  TRITON_URL_PREFIX,
  fetchApi,
  fetchOptionsDELETE,
  fetchOptionsGET,
  fetchOptionsPOST,
  fetchOptionsPUT,
} from './config';

export interface CycleEntity extends Entity {
  start_date: Moment;
  end_date: Moment;
  extended_end_date: Moment;
  ordinal: number;
}

export const queryByTeam = teamId => {
  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/cycles`;
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const getByTeamCurrent = teamId => {
  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/cycles/current`;
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const get = cycleId => {
  const url = `${TRITON_URL_PREFIX}/api/cycles/${cycleId}`;
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const post = cycle => {
  const url = `${TRITON_URL_PREFIX}/api/cycles?envelope=team_cycles`;
  const options = fetchOptionsPOST(cycle);
  return fetchApi(url, options);
};

export const update = cycle => {
  const url = `${TRITON_URL_PREFIX}/api/cycles/${
    cycle.uid
  }?envelope=team_cycles`;
  const options = fetchOptionsPUT(cycle);
  return fetchApi(url, options);
};

export const remove = cycleId => {
  const url = `${TRITON_URL_PREFIX}/api/cycles/${cycleId}?envelope=team_cycles`;
  const options = fetchOptionsDELETE();
  return fetchApi(url, options);
};
