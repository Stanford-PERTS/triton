import { getJwtToken } from 'services/triton/config';

const getAuthorization = () => `Bearer ${getJwtToken()}`;

export default getAuthorization;
