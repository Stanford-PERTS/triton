import React, { useContext } from 'react';

import TermsContext from 'components/TermsContext';
import SceneTitle from 'components/SceneTitle';

const OrgReportsWrapper = ({ children }) => {
  const terms = useContext(TermsContext);

  return (
    <>
      <SceneTitle title={`${terms.organization} Reports`} />
      <>{children}</>
    </>
  );
};

export default OrgReportsWrapper;
