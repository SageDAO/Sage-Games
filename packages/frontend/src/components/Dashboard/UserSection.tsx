import { User } from '@prisma/client';
import React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSortBy, useTable, usePagination, useGlobalFilter } from 'react-table';
import { UserDetailsModal } from './UserDetailsModal';
import { GlobalFilter } from './GlobalFilter';
import shortenAddress from '@/utilities/shortenAddress';

interface UserSectionProps {
  users: Array<User>;
}

export function UserSection({ users }: UserSectionProps) {
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<any>(undefined);
  const data = React.useMemo(() => JSON.parse(JSON.stringify(users)), []);
  const displayUserDetailsModal = (rowData: any) => {
    setUserDetails(rowData);
    setIsUserDetailsModalOpen((prevState) => !prevState);
  };
  const columns = React.useMemo(
    () => [
      {
        Header: '',
        accessor: 'profilePicture',
        Cell: (cell: any) => (
          <div className='dashboard-user__cell'>
            <img
              src={cell.value || '/sample/pfp.svg'}
              onClick={() => {
                displayUserDetailsModal(cell.row.original);
              }}
              className='dashboard-user__profile-img'
            />
          </div>
        ),
      },
      {
        Header: 'wallet',
        id: 'walletAddress',
        accessor: 'walletAddress',
        sortType: compareWallets,
        Cell: (cell: any) => (
          <div className='dashboard-user__wallet-cell' title={cell.value}>
            <div
              className='dashboard-user__wallet-clipboard'
              onClick={() => {
                navigator.clipboard.writeText(cell.value);
                toast.success('Address copied!');
              }}
            >
              <img src='/copy.svg' alt='' width='15' />
            </div>
            <div className='dashboard-user__wallet-short-address'>{shortenAddress(cell.value)}</div>
          </div>
        ),
      },
      {
        Header: 'points earned',
        accessor: 'EarnedPoints.totalPointsEarned',
      },
      {
        Header: 'username',
        accessor: 'username',
      },
      {
        Header: 'e-mail',
        accessor: 'email',
      },
      {
        Header: 'created',
        accessor: 'createdAt',
        Cell: (cell: any) => <span title={cell.value}>{cell.value.slice(0, 10)}</span>,
      },
      {
        Header: 'role',
        accessor: 'role',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        sortBy: [
          {
            id: 'walletAddress',
            desc: false,
          },
        ],
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  var _ = require('underscore');
  const pageRange = () => {
    let start = pageIndex - 2;
    let end = pageIndex + 2;
    if (end > pageCount) {
      start -= end - pageCount;
      end = pageCount;
    }
    if (start <= 0) {
      end += (start - 1) * -1;
      start = 1;
    }
    end = end > pageCount ? pageCount : end;
    return _.range(start, end + 1);
  };

  return (
    <>
      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        toggle={() => setIsUserDetailsModalOpen((prevState) => !prevState)}
        userData={userDetails}
      />
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <table {...getTableProps()} className='dashboard-user__table'>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className='dashboard-user__table__header'
                >
                  {column.render('Header')}
                  <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={i}>
                {row.cells.map((cell, j) => {
                  return (
                    <td {...cell.getCellProps()} className='dashboard-user__table__cell' key={j}>
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='dashboard-user__nav-container'>
        <nav>
          <ul className='dashboard-user__nav-list'>
            <li>
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className='dashboard-user__nav-btn-first'
              >
                {'<<'}
              </button>
            </li>
            <li>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className='dashboard-user__nav-btn-prev'
              >
                {'<'}
              </button>
            </li>
            {pageRange().map((pageItem: any, i: number) => {
              return (
                <li key={i}>
                  <button
                    onClick={() => gotoPage(pageItem - 1)}
                    className={`dashboard-user__nav-page-number${
                      pageItem == pageIndex + 1 && '--active'
                    }`}
                  >
                    {pageItem}
                  </button>
                </li>
              );
            })}
            <li>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className='dashboard-user__nav-btn-next'
              >
                {'>'}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className='dashboard-user__nav-btn-last'
              >
                {'>>'}
              </button>
            </li>
          </ul>
        </nav>

        <span>
          Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[5, 10, 25, 50, 100, 250].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function compareWallets(rowA: any, rowB: any, id: any) {
  let a = '' + rowA.values[id];
  let b = '' + rowB.values[id];
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
