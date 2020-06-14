import uri from 'urijs';

describe('absolute vs. relative', () => {
  it('returns absolute for a variety of protocols', () => {
    /* eslint-disable no-script-url */
    const abs = [
      'ftp://example.com',
      'javascript://evil.com',
      // 'file:///Documents/foo.txt', // urijs doesn't handle this one
      'http://localhost:3000/',
      'https://example.com',
      'https://example.com/path',
      'https://example.com//path',
      'https://example.com/path?redirect=//foo',
      'https://example.com/path?redirect=/foo#//fragment',
    ];

    for (const url of abs) {
      expect(uri(url).is('absolute')).toBe(true);
      expect(uri(url).is('relative')).toBe(false);
    }
  });

  it('returns absolute for protocol-relative urls', () => {
    const abs = [
      '//example.com',
      '//example.com/path',
      '//example.com//path',
      '//example.com/path?redirect=//foo',
      '//example.com/path?redirect=/foo#//fragment',
    ];

    for (const url of abs) {
      expect(uri(url).is('absolute')).toBe(true);
      expect(uri(url).is('relative')).toBe(false);
    }
  });

  it('return relative for typical app paths', () => {
    const rel = [
      '/users/demo',
      '/api/users/demo',
      'settings',
      'login?program=foo#fragment',
    ];

    for (const url of rel) {
      expect(uri(url).is('relative')).toBe(true);
      expect(uri(url).is('absolute')).toBe(false);
    }
  });

  // N.B. This doesn't work, urijs considers 'demo@perts.net' to be a url.
  xit('identifies non-urls', () => {
    const nonUrls = ['demo@perts.net', 'mailto:demo@perts.net'];

    for (const s of nonUrls) {
      expect(uri(s).is('url')).toBe(false);
    }
  });

  it('identifies protocols', () => {
    const protocols = [
      ['', '//example.com'],
      ['http', 'http://example.com'],
      ['https', 'https://example.com'],
      ['javascript', 'javascript:void(0)'],
      ['mailto', 'mailto:demo@perts.net'],
      ['file', 'file:///Documents/foo.txt'],
    ];

    for (const [protocol, url] of protocols) {
      expect(uri(url).protocol()).toBe(protocol);
    }
  });
});
