import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Field } from 'redux-form';

import Button from 'components/Button';

const CheckboxWrapper = styled.div`
  padding: 10px;
  input[type='checkbox'] {
    margin-right: 10px;
  }
`;

const LegalBox = styled.div`
  border: 1px solid gray;
  padding: 10px;
  color: gray;
  overflow-y: scroll;
  height: 200px;
  text-align: left;
  margin-bottom: 20px;
`;

const ConsentContent = ({
  titleText,
  introText,
  consentText,
  closingText,
  checkboxLabelText,
}) => (
  <>
    <h3>{titleText}</h3>
    {introText || null}
    <LegalBox>{consentText}</LegalBox>
    {closingText || null}
    <Button data-test="submit" type="submit">
      Continue
    </Button>
    <CheckboxWrapper>
      <Field
        component="input"
        name="noConsent"
        id="noConsent"
        type="checkbox"
      />
      <label htmlFor="noConsent">{checkboxLabelText}</label>
    </CheckboxWrapper>
  </>
);

ConsentContent.propTypes = {
  titleText: PropTypes.element.isRequired,
  introText: PropTypes.element,
  consentText: PropTypes.element.isRequired,
  closingText: PropTypes.element,
  checkboxLabelText: PropTypes.element.isRequired,
};

const EPTitleText = () => (
  <span>Contribute to Research on Classroom Improvement</span>
);

const EPIntroText = () => (
  <>
    <p>
      We at PERTS are thrilled you&rsquo;re using our Copilot platform to create
      a better learning climate in your school or classroom. We expect you will
      learn a lot this year, and we believe other educators could learn from
      your process.
    </p>
    <p>
      That&rsquo;s why we&rsquo;re conducting a research study this year to
      figure out what kinds of approaches work best and for whom. The
      information in the consent form below can help you decide whether you want
      to participate in the study.
    </p>
  </>
);

const EPConsentText = () => <></>;

const EPCheckboxLabelText = () => (
  <span>
    No thank you, I would not like my data to be used in the research study.
  </span>
);

export const EPConsent = () => (
  <ConsentContent
    titleText={<EPTitleText />}
    introText={<EPIntroText />}
    consentText={<EPConsentText />}
    checkboxLabelText={<EPCheckboxLabelText />}
  />
);
