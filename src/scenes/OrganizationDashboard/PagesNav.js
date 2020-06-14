import React from 'react';
import styled from 'styled-components';
import Button from 'components/Button';

const PagesNav = ({ numberOfPages, currentPage, onClick }) => {
  const pages = Array.from({ length: numberOfPages }, (v, i) => i);

  return (
    <PagesNavContainer>
      {pages.map((_, pg) => (
        <Button
          key={pg}
          disabled={pg + 1 === currentPage}
          onClick={() => onClick(pg + 1)}
        >
          {pg + 1}
        </Button>
      ))}
    </PagesNavContainer>
  );
};

const PagesNavContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;

  > :not(:last-child) {
    margin-right: 12px;
  }

  > button {
    width: 60px;
    padding: 0;
  }
`;

export default PagesNav;
