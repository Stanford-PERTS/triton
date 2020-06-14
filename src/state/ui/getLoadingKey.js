const getLoadingKey = ({ actionPrefix, actionSlice }) =>
  `${actionPrefix}_${actionSlice}`;

export default getLoadingKey;
