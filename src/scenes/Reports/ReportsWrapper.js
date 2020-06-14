import React, { useContext } from 'react';

import SceneTitle from 'components/SceneTitle';
import TermsContext from 'components/TermsContext';

const ReportsWrapper = ({ children }) => (
  <>
    <SceneTitle title={`${useContext(TermsContext).team} Reports`} />
    <>{children}</>
  </>
);

export default ReportsWrapper;
