import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import selectors from 'state/selectors';

import ProgramEP, { ProgramDocumentsEP } from './ep';
import ProgramBELESET, { ProgramDocumentsBELESET } from './beleset';
import ProgramCSET, { ProgramDocumentsCSET } from './cset';
import ProgramDemo, { ProgramDocumentsDemo } from './demoProgram';
import ProgramMSET, { ProgramDocumentsMSET } from './mset';

const Programs = {
  ep19: ProgramEP,
  beleset19: ProgramBELESET,
  cset19: ProgramCSET,
  demo: ProgramDemo, // for testing
  mset19: ProgramMSET,
};

export const ProgramDocumentsIndex = {
  ep19: ProgramDocumentsEP,
  beleset19: ProgramDocumentsBELESET,
  cset19: ProgramDocumentsCSET,
  demo: ProgramDocumentsDemo, // for testing
  mset: ProgramDocumentsMSET,
};

const ProgramDisplay = ({ program, teamId }) => {
  if (!program) {
    return null;
  }

  const Program = Programs[program.label];

  return <Program teamId={teamId} />;
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(ProgramDisplay);
