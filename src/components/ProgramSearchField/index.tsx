import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { ProgramEntity } from 'services/triton/programs';
import { search as searchCreator } from 'state/programs/actions';
import theme from 'components/theme';

const SearchContainer = styled.div`
  margin-top: 50px;
`;

const SearchStyled = styled.input`
  color: ${theme.palette.black};
  margin: 10px auto;
  padding: 5px;
  display: block;
`;

interface ProgramSearchProps {
  actions: { search: Function };
  program: ProgramEntity;
  query: string;
}

export const ProgramSearchComponent = ({
  actions: { search },
  program,
  query = '',
}: ProgramSearchProps) => {
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => setSearchValue(query), [query]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.currentTarget.value && event.key === 'Enter') {
      search(searchValue, program.label);
    }
  };

  return (
    <SearchContainer>
      <SearchStyled
        placeholder="search"
        type="text"
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
    </SearchContainer>
  );
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ search: searchCreator }, dispatch),
});

export default connect(
  null,
  mapDispatchToProps,
)(ProgramSearchComponent);
