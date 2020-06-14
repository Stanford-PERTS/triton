import moment from 'moment/moment';

import Entity from 'services/Entity';
import { TRITON_URL_PREFIX, fetchApi, getAuthorization } from './config';

interface MandrillTemplate {
  created_at: string;
  updated_at: string;
  labels: string[];
  publish_subject: string;
  publish_code: string;
  publish_name: string;
  slug: string;
}

export interface TemplateEntity extends Entity, MandrillTemplate {}

export const transformTemplate = (t: MandrillTemplate): TemplateEntity => ({
  ...t,
  uid: `Template_${t.slug}`,
  short_uid: t.slug,
  created: moment(t.created_at)
    .utc()
    .format(),
  modified: moment(t.updated_at)
    .utc()
    .format(),
});

/**
 * @return {Promise} resolving with server response, list of all mandrill
 *     templates with the `triton` label.
 */
export const query = () => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/mandrill_templates`;

  return fetchApi(url, options).then(templates =>
    templates.map(transformTemplate),
  );
};

/**
 * @param {string} templateId - "slug" of the template to get
 * @return {Promise} resolving with server response
 */
export const get = templateId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/mandrill_templates/${templateId}`;

  return fetchApi(url, options);
};
