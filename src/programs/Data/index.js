import { compose, setDisplayName } from 'recompose';
import get from 'lodash/get';
import { withAllContexts } from 'programs/contexts';

const Data = ({
  path,
  defaultValue,
  format,
  program,
  team,
  cycles,
  cycle,
  responses,
  response,
  step,
}) => {
  // Place all data into an object so we can take advantage of Lodash's get
  // function to `path` our way to the piece of data we want.
  // https://lodash.com/docs/4.17.11#get
  const data = get(
    {
      program,
      team,
      cycles,
      cycle,
      responses,
      response,
      step,
    },
    path,
  );

  // Data might be `null` if it's from the server, which represents SQL NULL
  // as JSON null. Undefined might occur if the path is invalid, or it's
  // pulling from a client-created object.
  if (data === undefined || data === null) {
    return defaultValue || null;
  }

  let formattedData = data;

  // If this is a MomentJS date, format it.
  // https://momentjs.com/docs/#/query/
  try {
    formattedData =
      data.isValid() && format
        ? data.format(format) // user supplied
        : data.format('MM-DD-YYYY'); // default
  } catch (error) {
    // continue on without formatting
  }

  return formattedData;
};

export default compose(
  withAllContexts,
  setDisplayName('Data'),
)(Data);
