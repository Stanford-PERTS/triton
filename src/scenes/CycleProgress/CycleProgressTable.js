import React from 'react';
import styled from 'styled-components/macro';
import { useTable, useSortBy, usePagination } from 'react-table';

import CenteredRow from 'components/CenteredRow';
import Icon, { IconStyled } from 'components/Icon';
import theme from 'components/theme';
import { PageNavLinkStyled } from 'components/PageNav/PageNavLink';

const SortHeader = styled.th`
  ${IconStyled} {
    margin-left: 10px;
  }
`;

const TableStyled = styled.table`
  table-layout: fixed;
  width: 100%;

  thead {
    border-bottom: 1px solid black;

    tr:last-child {
      th {
        padding-bottom: 10px;
      }
    }
  }

  tbody {
    tr:first-child {
      td {
        padding-top: 10px;
      }
    }

    tr:nth-child(even) {
      background-color: ${theme.palette.lightGray};
    }
  }

  th,
  td {
    text-align: center;

    padding: 5px;

    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CycleProgressTable = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,

    // from usePagination
    // https://codesandbox.io/embed/github/tannerlinsley/react-table/tree/master/examples/pagination
    page,
    canPreviousPage,
    canNextPage,
    // pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      // https://react-table.js.org/api/useSortBy#table-options
      initialState: {
        sortBy: [{ id: 'completed', desc: true }],
        pageSize: 20,
      },
    },
    useSortBy,
    usePagination,
  );

  const colStyles = [
    { width: '100px' }, // Complete
    { wordBreak: 'break-all' }, // Roster ID
    {}, // Class Name
    {}, // Contact
  ];

  return (
    <>
      <TableStyled {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                <SortHeader
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={colStyles[i]}
                >
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <Icon names="sort-desc" />
                    ) : (
                      <Icon names="sort-asc" />
                    )
                  ) : (
                    <Icon names="sort" />
                  )}
                </SortHeader>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell, i) => (
                  <td {...cell.getCellProps()} style={colStyles[i]}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </TableStyled>
      <CenteredRow>
        <PageNavLinkStyled
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          <Icon names="angle-double-left" />
        </PageNavLinkStyled>
        <PageNavLinkStyled onClick={previousPage} disabled={!canPreviousPage}>
          <Icon names="angle-left" />
        </PageNavLinkStyled>
        {Object.keys(new Array(pageCount).fill()).map((pageIndexLink, i) => (
          <PageNavLinkStyled
            key={i}
            onClick={() => gotoPage(pageIndexLink)}
            active={Number(pageIndex) === i}
          >
            {i + 1}
          </PageNavLinkStyled>
        ))}
        <PageNavLinkStyled onClick={nextPage} disabled={!canNextPage}>
          <Icon names="angle-right" />
        </PageNavLinkStyled>
        <PageNavLinkStyled
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          <Icon names="angle-double-right" />
        </PageNavLinkStyled>
      </CenteredRow>
      <CenteredRow>
        Rows per page:{' '}
        <input
          type="number"
          value={pageSize}
          onChange={e => setPageSize(Math.max(Number(e.target.value), 5))}
          style={{ width: '50px' }}
          min={5}
        />
      </CenteredRow>
    </>
  );
};

export default CycleProgressTable;
