// Convert an id (either uid or shortUid) into a shortUid for use in route
// parameters.

function toParams(id) {
  return id.includes('_') ? id.split('_')[1] : id;
}

export default toParams;
