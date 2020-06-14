const getSpecialJwt = storageName =>
  localStorage.getItem(`triton:auth:${storageName}`);

export default getSpecialJwt;
