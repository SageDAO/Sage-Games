import { User } from '@prisma/client';
import React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSortBy, useTable, usePagination, useGlobalFilter } from 'react-table';
import { UserDetailsModal } from './UserDetailsModal';
import { GlobalFilter } from './GlobalFilter';
import shortenAddress from '@/utilities/shortenAddress';

interface UserSectionProps {
  users: User[];
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
          <div className='mx-auto relative sm:w-11 sm:h-11 w-11 h-11 overflow-hidden rounded-full shadow-md bg-white border-1'>
            <img
              src={cell.value || '/sample/pfp.svg'}
              onClick={() => {
                displayUserDetailsModal(cell.row.original);
              }}
              className='mx-auto cursor-pointer'
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
          <div className='mx-auto flex items-center text-center justify-center' title={cell.value}>
            <div
              className='mx-3 bg-white rounded-full h-8 w-8 shadow-md border dark:border-gray-878786 flex items-center justify-center cursor-pointer filter active:brightness-95 dark:bg-black'
              onClick={() => {
                navigator.clipboard.writeText(cell.value);
                toast.success('Address copied!');
              }}
            >
              <img src='/copy.svg' alt='' width='15' className='dark:invert' />
            </div>
            <div className='font-mono mr-3'>{shortenAddress(cell.value)}</div>
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
      <table {...getTableProps()} className='border border-purple-figma w-full mx-auto dark:invert'>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={{
                    borderBottom: 'solid 3px black',
                    background: 'aliceblue',
                    color: 'black',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
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
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '5px',
                        border: 'solid 1px gray',
                      }}
                      className='text-center'
                      key={j}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='mt-5 mx-auto text-center'>
        <nav>
          <ul className='inline-flex -space-x-px'>
            <li>
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className='py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                {'<<'}
              </button>
            </li>
            <li>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className='py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                {'<'}
              </button>
            </li>
            {pageRange().map((pageItem: any, i: number) => {
              return (
                <li key={i}>
                  <button
                    onClick={() => gotoPage(pageItem - 1)}
                    className={
                      pageItem == pageIndex + 1
                        ? 'py-2 px-3 leading-tight text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                        : 'py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    }
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
                className='py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                {'>'}
              </button>
            </li>
            <li>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className='py-2 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              >
                {'>>'}
              </button>
            </li>
          </ul>
        </nav>

        <span className='mt-5 mx-3'>
          Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          className='mt-5 mx-3'
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
