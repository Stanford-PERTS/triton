import isExternal from './isExternal';

describe('isExternal helper function', () => {
  /* eslint-disable max-len */
  // When running in the app, we can expect the function to detect it's current
  // location and establish a normalized protocol, hostname, and port. Here in
  // the test we'll supply that location.
  const localhost = 'http://localhost:3000/foo?bar=baz#frag';
  const deployed = 'https://copilot.perts.net/foo?bar=baz#frag';

  it('external for local protocol-ed urls with different ports', () => {
    expect(isExternal('http://localhost:10080', localhost)).toBe(true);
  });

  it('external for deployed protocol-ed urls with different hostname', () => {
    expect(isExternal('http://example.com', deployed)).toBe(true);
  });

  it('external for local protocol-relative urls with different ports', () => {
    expect(isExternal('//localhost:10080', localhost)).toBe(true);
  });

  it('external for deployed protocol-relative urls with different hostname', () => {
    expect(isExternal('//example.com', deployed)).toBe(true);
  });

  it('internal for local protocol-ed urls with matching port', () => {
    expect(isExternal('http://localhost:3000/to-path', localhost)).toBe(false);
  });

  it('internal for deployed protocol-ed urls with matching hostname', () => {
    expect(isExternal('https://copilot.perts.net/to-path', deployed)).toBe(
      false,
    );
  });

  it('internal for local protocol-relative urls with matching ports', () => {
    expect(isExternal('//localhost:3000/to-path', localhost)).toBe(false);
  });

  it('internal for deployed protocol-relative urls with matching hostname', () => {
    expect(isExternal('//copilot.perts.net/to-path', deployed)).toBe(false);
  });

  it('internal for relative', () => {
    expect(isExternal('/to-path')).toBe(false);
    expect(isExternal('to-path')).toBe(false);
    expect(isExternal('to-path?foo')).toBe(false);
    expect(isExternal('#fragment')).toBe(false);
  });
});
