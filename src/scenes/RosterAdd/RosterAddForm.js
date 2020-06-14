import React from 'react';
import countBy from 'lodash/countBy';
import keys from 'lodash/keys';
import pickBy from 'lodash/pickBy';
import { compose } from 'recompose';
import { Field, reduxForm } from 'redux-form';

import Button from 'components/Button';
import InfoBox from 'components/InfoBox';
import InfoBoxList from 'components/InfoBoxList';
import SectionItem from 'components/SectionItem';
import TextArea from 'components/Form/TextArea';

import validate, { ID_PATTERN } from './validate';
import splitAndTrimLines from 'utils/splitAndTrimLines';
import stripToken from 'utils/stripToken';

class ClassroomRosterAddForm extends React.Component {
  getBadIds = () => {
    const { formValues, participants } = this.props;

    let invalidIds = [];
    let duplicateIds = [];

    if (formValues) {
      // Get display ids of existing who match based on stripped ids.
      const enteredIds = splitAndTrimLines(formValues.student_ids);
      const strippedIds = enteredIds.map(stripToken);
      const dupeIds = participants
        .filter(p => strippedIds.includes(p.stripped_student_id))
        .map(p => p.student_id);

      // Get duplicates from entered values.
      const freq = countBy(strippedIds);
      const repeated = pickBy(freq, (f, id) => f > 1);
      const repeatedEntered = keys(repeated);

      // These entered values just don't scan.
      invalidIds = [...new Set(enteredIds.filter(id => !ID_PATTERN.test(id)))];
      // These are a combination of existing student ids that collide with
      // entered values, and entered values that are repeated in the form.
      duplicateIds = [...new Set(dupeIds.concat(repeatedEntered))];
    }

    return { invalidIds, duplicateIds };
  };

  render() {
    const {
      updating,
      // callbacks
      addStudentIds,
      handleSubmit,
      // redux-form
      invalid,
      pristine,
    } = this.props;

    const { invalidIds, duplicateIds } = this.getBadIds();

    return (
      <SectionItem className="ClassroomRosterAddForm">
        <form
          className="TeamDetailsForm"
          onSubmit={handleSubmit(addStudentIds)}
        >
          <Field
            component={TextArea}
            label="Roster IDs"
            name="student_ids"
            placeholder={
              'Enter one Roster ID per line or copy and paste from a ' +
              'spreadsheet.'
            }
            type="text"
          />
          {invalidIds.length > 0 && (
            <InfoBox alignLeft>
              <div>
                IDs must be at least 3 characters with no spaces. These will not
                be added:
                <InfoBoxList list={invalidIds} />
              </div>
            </InfoBox>
          )}
          {duplicateIds.length > 0 && (
            <InfoBox alignLeft>
              <div>
                These are either already on the roster or are listed twice. Each
                new ID will only be added once:
                <InfoBoxList list={duplicateIds} />
              </div>
            </InfoBox>
          )}
          <Button type="submit" disabled={pristine || invalid || updating}>
            Add IDs to Roster
          </Button>
        </form>
      </SectionItem>
    );
  }
}

export default compose(reduxForm({ form: 'classroomRosterAdd', validate }))(
  ClassroomRosterAddForm,
);
