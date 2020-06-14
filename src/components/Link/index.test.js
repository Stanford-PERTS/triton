import React from 'react';
import withParams from './withParams';

describe('withParams', () => {
  const TestComponent = () => <div>Hello!</div>;

  // This console.error is too noisy; not helpful.
  xit('should console.error when params are not provided by router', () => {
    const props = {
      match: {
        params: {
          teamId: 'Team_001',
        },
      },
      to: '/teams/:teamId/classrooms/:classroomId',
    };

    const spy = jest.spyOn(console, 'error');

    withParams(TestComponent)(props);
    expect(spy).toHaveBeenCalled();

    spy.mockReset();
  });

  it('should not console.error when no :paramId on route/external link', () => {
    const props = {
      match: {
        params: {
          teamId: 'Team_001',
        },
      },
      to: 'http://qualtrics.com',
    };

    const spy = jest.spyOn(console, 'error');

    withParams(TestComponent)(props);
    expect(spy).not.toHaveBeenCalled();

    spy.mockReset();
  });
});
