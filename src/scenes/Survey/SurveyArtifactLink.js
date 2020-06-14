import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import { reduxForm, Field } from 'redux-form';
import { formName } from './config';

import RadioField from 'components/Form/RadioField';
import TextField from 'components/Form/TextField';
import Link from 'components/Link';
import SectionItem from 'components/SectionItem';

const SurveyArtifactLink = props => {
  const useArtifact =
    props.formValues.meta && props.formValues.meta.artifact_use === 'true';

  const clearArtifactUrlIfDisabled = e => {
    const { change } = props;

    if (e.target.value === 'false') {
      change('meta.artifact_url', '');
    }
  };

  return (
    <SectionItem>
      <p>
        How will you share the artifact you want to improve with students who
        are providing feedback?
      </p>

      <Field
        component={RadioField}
        name="meta.artifact_use"
        onChange={clearArtifactUrlIfDisabled}
        options={{
          true: (
            <>
              I would like to embed the artifact into the survey and will enter
              the hyperlink to the artifact below.
            </>
          ),
          false: (
            <>
              I will share the artifact directly with students (e.g. hard copy,
              in person).
            </>
          ),
        }}
      />

      <p>
        For technical guidance on creating a hyperlink, go to{' '}
        <Link to="https://perts.net/messageit/links" externalLink>
          perts.net/messageit/links
        </Link>
        .
      </p>

      <Field
        component={TextField}
        name="meta.artifact_url"
        label="Artifact URL"
        placeholder="Enter URL here"
        disabled={!useArtifact}
      ></Field>
    </SectionItem>
  );
};

const mapStateToProps = (state, props) => ({
  formValues: selectors.form.values(state, props),
});

export default compose(
  reduxForm({ form: formName }),
  connect(mapStateToProps),
)(SurveyArtifactLink);
