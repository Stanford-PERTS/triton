import React from 'react';
import { shallow } from 'enzyme';
import noop from 'lodash/noop';

import UserWelcomeForm from './UserWelcomeForm';

jest.mock('./UserWelcomeFormName', () => ({
  __esModule: true,
  default: () => null,
  shouldDisplay: () => true, // displays this page on mount
}));
jest.mock('./UserWelcomeFormConsent', () => ({
  __esModule: true,
  default: () => null,
  shouldDisplay: () => false,
}));
jest.mock('./UserWelcomeTutorial', () => ({
  __esModule: true,
  default: () => null,
  shouldDisplay: () => false,
}));

describe('Welcome paging', () => {
  it("fails gracefully when remaining pages don't display", () => {
    const dismiss = jest.fn();
    const wrapper = shallow(
      <UserWelcomeForm
        dismiss={dismiss}
        onSubmit={noop}
        program={{}}
        user={{}}
      />,
    );
    wrapper.instance().nextPage();
    expect(dismiss).toHaveBeenCalled();
  });
});
