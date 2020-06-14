import { all, put, select } from 'redux-saga/effects';
import get from 'lodash/get';

import formAction from 'state/form/emailSelected/actions';
import formSubmissionError from 'utils/formSubmissionError';
import { post } from 'services/triton/emails';
import sel from 'state/selectors';
import { callWithApiAuthentication } from 'state/api';
import { searchForm } from 'scenes/ProgramSearch';
import { replacePaths } from 'scenes/ProgramSearch/EmailPreview';
import { CONTACT_EMAIL_ADDRESS } from 'services/triton/config';

export default function* emailSelectedForm({ payload }) {
  const {
    formValues: { program, recipientAddresses, templateSlug },
  } = payload;

  try {
    const recipients = yield select(sel.search.selected.recipients.list, {
      searchForm,
    });

    // Convert copy-and-paste friendly string of comma-separated email addresses
    // into an array we can work with.
    const addresses = recipientAddresses.replace(/,\s*/g, ',').split(',');

    // Send a POST request for each recipient, creating an Email entity on
    // the server for each, which our cron job will gradually send to Mandrill.
    // Use the action's program, and the user from the store, to assemble
    // the mandrill_template_content.
    yield all([
      ...addresses.map(address => {
        const data = {
          program,
          user: recipients.find(u => u.email === address),
          CONTACT_EMAIL_ADDRESS,
        };
        const templateData = {};
        for (const [key, path] of Object.entries(replacePaths)) {
          templateData[key] = get(data, path);
        }
        return callWithApiAuthentication(
          post,
          address,
          templateSlug,
          templateData,
        );
      }),
    ]);

    yield put(formAction.success());
  } catch (error) {
    console.error(error);
    const formError = formSubmissionError('Unable to save changes.');
    yield put(formAction.failure(formError));
  }
}
