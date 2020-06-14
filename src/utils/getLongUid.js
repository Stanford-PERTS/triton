export default function getLongUid(kind, id) {
  kind = kind.charAt(0).toUpperCase() + kind.slice(1);

  // Don't convert to long uid if the ID provided is already long.
  if (id.indexOf(`${kind}_`) > -1) {
    return id;
  }

  return `${kind}_${id}`;
}
