import uri from 'urijs';

export default function isExternal(comparisonUrl, currentUrl) {
  if (!currentUrl) {
    currentUrl = window.location.href;
  }

  const comparisonUri = uri(comparisonUrl);
  const currentUri = uri(currentUrl);

  if (comparisonUri.is('relative')) {
    return false;
  }

  // N.B. The host includes the port, so localhost:8080 is external to
  // localhost:3000, which is what we want.
  return comparisonUri.host() !== currentUri.host();
}
