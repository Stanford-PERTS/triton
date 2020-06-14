import React from 'react';
import capitalize from 'lodash/capitalize';

import DeleteButton from 'components/DeleteButton';
import SubmitButton from 'components/Form/SubmitButton';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const FormActions = props => {
  const {
    mode,
    deleting,
    displayEntity,
    handleDelete,
    mayDelete,
    handleSubmit,
    submitAnd,
    submittable,
    submitting,
  } = props;
  const form = props.form.toLowerCase();
  const displayText = displayEntity || form;
  const displayTextCapital = capitalize(displayText);

  const shouldDisplayDelete =
    handleDelete && (mode === 'update' || mode === 'afterAdd') && mayDelete;

  const DeleteButtonComponent = () => (
    <Section title="Danger Zone" danger>
      <SectionItem>
        <DeleteButton
          initialText={
            <span>Are you sure you want to delete this {displayText}?</span>
          }
          confirmationText={
            <span>
              Once you delete a {displayText}, there&rsquo;s no way to undo.
            </span>
          }
          loading={deleting}
          loadingText={<span>Deleting {displayTextCapital}</span>}
          onClick={handleDelete}
        >
          {`Delete ${displayTextCapital}`}
        </DeleteButton>
      </SectionItem>
    </Section>
  );

  return (
    <>
      {handleSubmit && (
        <SubmitButton
          and={submitAnd}
          onClick={handleSubmit}
          className="block"
          mode={mode}
          form={form}
          displayEntity={displayEntity}
          disabled={!submittable}
          submitting={submitting}
        />
      )}
      {shouldDisplayDelete && <DeleteButtonComponent />}
    </>
  );
};

FormActions.defaultProps = {
  form: '',
};

export default FormActions;
