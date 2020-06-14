/**
 * Get a full path from applying a relative path to a base path.
 * @param  {string} basePath     path to start from, should start with a slash
 * @param  {string} relativePath to apply, normally with dots, like '../foo'
 * @return {string}              resulting path
 * @throws {Error} if relativePath starts with a slash
 */
export default function combinePaths(basePath, relativePath) {
  // Strip trailing slashes.
  const trailingSlash = /\/$/;
  basePath = basePath.replace(trailingSlash, '');
  relativePath = relativePath.replace(trailingSlash, '');

  const leadingSlash = /^\//;
  if (leadingSlash.test(relativePath)) {
    throw new Error('Relative path must not have a leading slash.');
  }

  const baseParts = basePath.split('/');
  const relativeParts = relativePath.split('/');

  relativeParts.forEach(part => {
    if (part === '.') {
      return;
    }

    if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  });

  return baseParts.join('/');
}
