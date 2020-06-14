import React, { useContext } from 'react';
import { Field } from 'redux-form';

import TermsContext from 'components/TermsContext';
import TextField from 'components/Form/TextField';
import Card from 'components/Card';
import Link from 'components/Link';

export const OrganizationCodeText = () => {
  const terms = useContext(TermsContext);

  return (
    <Card.Content>
      <p>
        To associate {terms.a.team.toLowerCase()} with this{' '}
        {terms.organization.toLowerCase()}, the {terms.captain.toLowerCase()}{' '}
        must use the {terms.organization.toLowerCase()} code below. Refer to{' '}
        <Link to="https://perts.net/copilot/faq#how-associate-team">
          {/*
            @todo(chris): figure out if this non-customized language
            in the FAQ is a problem.
          */}
          How do you attach a project to a community?
        </Link>{' '}
        in the FAQ.
      </p>
      <Field
        component={TextField}
        name="code"
        label={`${terms.organization} Code`}
        type="text"
        readOnly
      />
    </Card.Content>
  );
};

const OrganizationCode = () => {
  const terms = useContext(TermsContext);
  return (
    <Card>
      <Card.Header>{terms.organization} Code</Card.Header>
      <OrganizationCodeText />
    </Card>
  );
};

export default OrganizationCode;
