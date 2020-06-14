import { getAuthorization } from 'services/triton/config';

// Default fetch DELETE options
export const fetchOptionsDELETE = () => ({
  method: 'DELETE',
  headers: {
    Authorization: getAuthorization(),
  },
});

// Default fetch GET options
export const fetchOptionsGET = () => ({
  method: 'GET',
  headers: {
    Authorization: getAuthorization(),
  },
});

// Default fetch POST options
export const fetchOptionsPOST = entity => ({
  method: 'POST',
  headers: {
    Authorization: getAuthorization(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(entity),
});

// Default fetch PUT options
export const fetchOptionsPUT = entity => ({
  method: 'PUT',
  headers: {
    Authorization: getAuthorization(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(entity),
});

// Default fetch PATCH options
export const fetchOptionsPATCH = entity => ({
  method: 'PATCH',
  headers: {
    Authorization: getAuthorization(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(entity),
});
