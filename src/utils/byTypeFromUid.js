/**
 * Given a uid like Team_2816a21d78f5, this function will return the BY_TEAM
 * string that is used in our redux actions/reducers.
 * @param  {string} uid entity uid
 * @return {string}     entity BY_TYPE
 */
export const byTypeFromUid = uid => {
  const [entity] = uid.split('_');
  return `BY_${entity.toUpperCase()}`;
};

export default byTypeFromUid;
