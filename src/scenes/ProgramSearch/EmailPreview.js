import React from 'react';
import get from 'lodash/get';
import styled from 'styled-components/macro';

import theme from 'components/theme';
import { CONTACT_EMAIL_ADDRESS } from 'services/triton/config';

const ReplacePaths = styled.ul`
  text-align: left;
`;

const PreviewNav = styled.div`
  > button {
    margin: 5px 10px;
  }
`;

const PreviewBox = styled.div`
  padding: 7px;
  border: 1px solid ${theme.palette.darkGray};
  border-radius: 3px;
  font-size: 14px;
  cursor: not-allowed;
`;

const Code = styled.pre`
  text-align: left;
`;

export const replacePaths = {
  program_name: 'program.name',
  user_name: 'user.name',
  user_email: 'user.email',
  contact_email_address: 'CONTACT_EMAIL_ADDRESS',
};

class EmailPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showTerms: false, userIndex: 0 };
  }

  /**
   * Replace tokens in a mandrill email template with client data.
   * @param  {ProgramEntity} program from store
   * @param  {UserEntity}    user    from store
   * @param  {string}        code    mandrill template text (html w/ tokens)
   * @return {string}                code with replacements made
   */
  interpolate = (program, user, code) => {
    const data = {
      program,
      user,
      CONTACT_EMAIL_ADDRESS,
    };
    for (const [token, path] of Object.entries(replacePaths)) {
      // IMPORTANT: only hard-coded values should be interpolated into this
      // regexp. See `const replacePaths` above.
      const r = new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`, 'g');
      code = code.replace(r, get(data, path));
    }
    return code;
  };

  render() {
    const { allUsers = [], program, template } = this.props;
    const { showTerms, userIndex } = this.state;
    const user = allUsers[userIndex]; // UI can scroll through available users

    return (
      <div>
        {/* Give users a reference for what data is available. */}
        <button
          onClick={event => {
            event.preventDefault();
            this.setState({ showTerms: !this.state.showTerms });
          }}
        >
          Available replacement terms
        </button>
        {showTerms && (
          <ReplacePaths>
            {Object.keys(replacePaths).map(path => (
              <li key={path}>{path}</li>
            ))}
          </ReplacePaths>
        )}

        {/* Let users page through available recipients/users. */}
        <PreviewNav>
          <button
            onClick={event => {
              event.preventDefault();
              this.setState({ userIndex: Math.max(userIndex - 1, 0) });
            }}
          >
            &lt;
          </button>
          {Math.min(userIndex + 1, allUsers.length)} of {allUsers.length}
          <button
            onClick={event => {
              event.preventDefault();
              this.setState({
                userIndex: Math.min(userIndex + 1, allUsers.length - 1),
              });
            }}
          >
            &gt;
          </button>
        </PreviewNav>

        {/* Display mandrill template with replacements made. */}
        <PreviewBox>
          {template ? (
            <Code>
              {this.interpolate(program, user, template.publish_code)}
            </Code>
          ) : (
            <em>Please choose a template to see a preview.</em>
          )}
        </PreviewBox>
      </div>
    );
  }
}

export default EmailPreview;
