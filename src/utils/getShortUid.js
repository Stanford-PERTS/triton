const getShortUid = uid => (uid.includes('_') ? uid.split('_')[1] : uid);

export default getShortUid;
