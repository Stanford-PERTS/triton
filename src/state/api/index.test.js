import { call, put } from 'redux-saga/effects';
import * as apiTypes from './actionTypes';
import * as authTypes from 'state/auth/actionTypes';
import { callWithApiAuthentication } from './index';

describe('callWithApiAuthentication', () => {
  it('should return results of "ok" responses', () => {
    const fn = i => i;
    const argument = 123;
    const response = { ok: true, code: 200, otherProp: 'something else' };

    const gen = callWithApiAuthentication(fn, argument);

    // should call the provided function with provided arguments
    expect(gen.next().value).toEqual(call(fn, argument));

    // should return the response
    expect(gen.next(response).value).toEqual(response);
  });

  it('should handle response with status 401', () => {
    const fn = i => i;
    const argument = 123;
    const response = { ok: false, code: 401, otherProp: 'something else' };

    const gen = callWithApiAuthentication(fn, argument);

    // should call the provided function with provided arguments
    expect(gen.next().value).toEqual(call(fn, argument));

    // should put AUTH_TOKEN_INVALID
    expect(gen.throw(response).value).toEqual(
      put({ type: apiTypes.AUTH_TOKEN_INVALID }),
    );

    // and should put LOGOUT_REQUEST
    expect(gen.next().value).toEqual(put({ type: authTypes.LOGOUT_REQUEST }));

    // should return the response
    // expect(gen.next().value).toEqual(response);
    // TODO @taptapdan how to test for errors thrown
  });
});
