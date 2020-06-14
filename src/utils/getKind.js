export default function getKind(uid) {
  if (!uid.includes('_')) {
    throw new Error("Not a long uid, can't establish kind.");
  }
  return uid.split('_')[0];
}
