import React from 'react';
import { useGetPointsBalanceQuery } from '@/store/services/pointsReducer';
import Modal from '@/components/Modals';
import Countdown from 'react-countdown';
import { msToTime } from '@/utilities/time';

import {
  useSortBy,
  useTable,
  usePagination,
  useGlobalFilter,
  useAsyncDebounce,
  Row,
} from 'react-table';

import { Role, User } from '@prisma/client';
import { toast } from 'react-toastify';
import { Tab } from '@headlessui/react';
import { Fragment, useState } from 'react';
import Loader from 'react-loader-spinner';
import {
  LotteryStats,
  useGetAllUsersAndEarnedPointsQuery,
  useGetLotteriesStatsQuery,
} from '@/store/services/_deprecated-dashboard';
import { useGetUserQuery } from '@/store/services/user';

function shortenAddress(address: string) {
  return address?.slice(0, 4) + '...' + address?.slice(-4);
}

export default function dashboard() {
  const isAdmin = (user: any) => {
    return user && Role.ADMIN == user.role;
  };
  const { data: user, isFetching: isFetchingUser } = useGetUserQuery();
  const {
    data: lotteryData,
    error: lotteryError,
    isFetching: isFetchingLotteries,
  } = useGetLotteriesStatsQuery(undefined, { skip: !isAdmin(user) });
  const {
    data: users,
    error: usersError,
    isFetching: isFetchingUsers,
  } = useGetAllUsersAndEarnedPointsQuery(undefined, { skip: !isAdmin(user) });

  if (isFetchingUser || isFetchingLotteries || isFetchingUsers) {
    return (
      <div className='mt-12 ml-12'>
        <br />
        <Loader type='ThreeDots' color='black' height={10} width={50} timeout={0} />
      </div>
    );
  }
  if (lotteryError || usersError) {
    return <div className='mt-12 ml-12'>Oops, an error occured</div>;
  }
  if (!isAdmin(user)) {
    return <div className='mt-12 ml-12'>Please connect with an admin wallet</div>;
  }

  return <DashBoardPage lotteriesStats={lotteryData as LotteryStats[]} users={users as User[]} />;
}

interface Props {
  lotteriesStats: LotteryStats[];
  users: User[];
}

function DashBoardPage({ lotteriesStats, users }: Props) {
  return (
    <div className='w-full lg:px-12'>
      <div className='w-full sm:bg-white dark:sm:bg-black bg:gray h-screen lg:rounded-3xl flex flex-col sm:flex-row'>
        <Tab.Group
          as='div'
          className='flex-grow rounded-tr-3xl rounded-br-3xl flex flex-col sm:overflow-y-hidden'
        >
          <Tab.List
            as='div'
            className='rounded-tr-3xl border-b-2 border-gray-200 dark:border-gray-313131 px-6 flex relative items-center text-black dark:text-white justify-center lg:justify-start'
          >
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={` font-bold w-36 text-sm box-border outline-none h-20 duration-100 ease-in ${
                    selected && 'border-b-2 border-purple-figma text-purple-figma'
                  }`}
                >
                  Lotteries
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`font-bold w-36 text-sm box-border h-20 duration-100 ease-in ${
                    selected && 'border-b-2 border-purple-figma text-purple-figma'
                  }`}
                >
                  Users
                </button>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels
            as='div'
            className='h-full rounded-br-3xl sm:overflow-y-scroll lg:p-10 p-3 lg:bg-transparent sm:mx-2'
          >
            <Tab.Panel as='div' className='w-full justify-items-center'>
              <LotterySection lotteriesStats={lotteriesStats} />
            </Tab.Panel>
            <Tab.Panel as='div' className='w-full justify-items-center'>
              <UserSection users={users} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

interface LotterySectionProps {
  lotteriesStats: LotteryStats[];
}

function getLotteryStatus(contractVal: number) {
  switch (contractVal) {
    case 0:
      return 'Created';
    case 1:
      return 'Canceled';
    case 2:
      return 'Closed';
    case 3:
      return 'Completed';
    default:
      return;
  }
}

function LotterySection({ lotteriesStats }: LotterySectionProps) {
  const iconSize = 28;

  function getDateYYYYMMDDhhmmss(): string {
    var d = new Date();
    return (
      d.getFullYear() +
      ('0' + (d.getMonth() + 1)).slice(-2) +
      ('0' + d.getDate()).slice(-2) +
      ('0' + d.getHours()).slice(-2) +
      ('0' + d.getMinutes()).slice(-2) +
      ('0' + d.getSeconds()).slice(-2)
    );
  }

  function download(filename: string, filecontents: string) {
    var element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(filecontents)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function downloadTickets(lotteryId: number) {
    var filecontents = 'wallet,numTicketsPoints,numTicketsCoins';
    lotteriesStats.forEach((lotto) => {
      if (lotteryId == lotto.lotteryId) {
        lotto.participants.forEach((item) => {
          filecontents +=
            '\r\n' + item.walletAddress + ',' + item.numTicketsPoints + ',' + item.numTicketsCoins;
        });
      }
    });
    download(`lottery_${lotteryId}_tickets_${getDateYYYYMMDDhhmmss()}.txt`, filecontents);
  }

  async function downloadPrizes(lotteryId: number) {
    var filecontents = 'nftId,winnerAddress,createdAt,claimedAt';
    var request = fetch(`/api/prizes?action=GetLotteryPrizes&lotteryId=${lotteryId}`);
    toast.promise(request, {
      pending: 'Retrieving prize data...',
      success: 'Success! File ready for download.',
      error: 'Failure! Unable to complete request.',
    });
    let prizeProofEntries: any = await (await request).json();
    prizeProofEntries.forEach((item: any) => {
      filecontents +=
        '\r\n' +
        item.nftId +
        ',' +
        item.winnerAddress +
        ',' +
        item.createdAt +
        ',' +
        item.claimedAt;
    });
    download(`lottery_${lotteryId}_prizes_${getDateYYYYMMDDhhmmss()}.txt`, filecontents);
  }

  return (
    <div className='dark:invert flex-col'>
      {lotteriesStats.map((lottoStats: LotteryStats, i: number) => {
        return (
          <div
            key={i}
            className='m-auto shadow-lg rounded-2xl border shadow-md w-full mt-4 px-6 pt-4 pb-4 mb-0 md:mb-0'
          >
            <div className='flex flex-wrap items-center'>
              {/* ----- column 1: lottery identification ----- */}
              <div className='w-full md:w-1/3'>
                <div
                  onClick={() => {
                    window.location.href = `/drops/${lottoStats.lotteryId}`;
                  }}
                  className='flex items-center text-center justify-center mx-auto w-36 h-36 text-center rounded-md border-solid border-black border-solid border-2 cursor-pointer'
                >
                  drop # {lottoStats.lotteryId}
                </div>
              </div>
              {/* ----- column 2: lottery stats ----- */}
              <div className='w-full md:w-1/3'>
                {/* row 1: participants */}
                <div className='flex flex-wrap items-center my-1'>
                  <div className='w-full md:w-1/4'>
                    {lottoStats.participants.length > 0 ? (
                      <a href='#' onClick={() => downloadTickets(lottoStats.lotteryId)}>
                        <img
                          className='mx-auto'
                          src='/wallet.svg'
                          width={iconSize}
                          height={iconSize}
                          alt=''
                        />
                      </a>
                    ) : (
                      <img
                        className='mx-auto'
                        src='/wallet.svg'
                        width={iconSize}
                        height={iconSize}
                        alt=''
                      />
                    )}
                  </div>
                  <div className='w-full md:w-3/4'>
                    <b>{lottoStats.participants.length}</b> participating wallets
                  </div>
                </div>
                {/* row 2: total tickets */}
                <div className='flex flex-wrap items-center my-1'>
                  <div className='w-full md:w-1/4'>
                    <img
                      className='mx-auto'
                      src='/ticket.svg'
                      width={iconSize}
                      height={iconSize}
                      alt=''
                    />
                  </div>
                  <div className='w-full md:w-3/4'>
                    <b>{lottoStats.numTicketsCoins + lottoStats.numTicketsPoints}</b> tickets sold
                  </div>
                </div>
                {/* rows 3 & 4: tickets breakdown */}
                {lottoStats.numTicketsCoins + lottoStats.numTicketsPoints > 0 ? (
                  <>
                    <div className='flex flex-wrap items-center my-1'>
                      <div className='w-full md:w-1/4'>
                        <img
                          className='mx-auto'
                          src='/pineapple.svg'
                          width={iconSize}
                          height={iconSize}
                          alt=''
                        />
                      </div>
                      <div className='w-full md:w-3/4'>
                        <b>{lottoStats.numTicketsPoints}</b> tickets from points &nbsp;
                        <span className='text-xs'>
                          (
                          {(
                            lottoStats.numTicketsPoints * Number(lottoStats.ticketCostPoints)
                          ).toLocaleString()}{' '}
                          pinas)
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center my-1'>
                      <div className='w-full md:w-1/4'>
                        <img
                          className='mx-auto'
                          src='/money-bag.svg'
                          width={iconSize}
                          height={iconSize}
                          alt=''
                        />
                      </div>
                      <div className='w-full md:w-3/4'>
                        <b>{lottoStats.numTicketsCoins}</b> tickets from coins &nbsp;
                        <span className='text-xs'>
                          (
                          {(
                            (lottoStats.numTicketsCoins * Number(lottoStats.ticketCostCoins)) /
                            10 ** 18
                          ).toLocaleString()}{' '}
                          ftm)
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
              {/* ----- column 3: lottery countdown & prizes ----- */}
              <div className='w-full md:w-1/3 px-3 text-center'>
                {'Created' == getLotteryStatus(lottoStats.status) ? (
                  <Countdown
                    date={new Date(lottoStats.closeTime * 1000)}
                    intervalDelay={1000}
                    precision={3}
                    renderer={({ days, total, completed }) => (
                      <div className='row-span-2 col-span-1 lg:row-span-1 lg:col-span-2  flex flex-col items-center text-center justify-center space-y-1 p-4 border-r lg:border-r-0 lg:border-b '>
                        <h1 className='text-sm xl:text-2xl text-red-500 font-bold'>
                          {completed ? 'Closed' : 'Drawing In'}
                        </h1>
                        {completed ? null : (
                          <h1 className='text-lg xl:text-3xl font-bold'>
                            {days > 2 ? days + ' Days' : msToTime(total)}
                          </h1>
                        )}
                      </div>
                    )}
                  />
                ) : (
                  <h1 className='text-sm xl:text-2xl font-bold'>
                    {getLotteryStatus(lottoStats.status)}
                    <br />
                    &nbsp;
                  </h1>
                )}
                {/* row 2: prizes */}
                {lottoStats.prizesDrawn ? (
                  <div className='flex flex-wrap items-center my-1'>
                    <div className='w-full md:w-1/4'>
                      <a href='#' onClick={() => downloadPrizes(lottoStats.lotteryId)}>
                        <img
                          className='float-right mr-3'
                          src='/prize.svg'
                          width={iconSize - 2}
                          alt=''
                        />
                      </a>
                    </div>
                    <div className='w-full md:w-3/4'>
                      <b>{lottoStats.prizesDrawn}</b> - <b>{lottoStats.prizesClaimed}</b> prizes
                      drawn / claimed
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface UserSectionProps {
  users: User[];
}

interface GlobalFilterProps {
  preGlobalFilteredRows: Row<object>[];
  globalFilter: any;
  setGlobalFilter: any;
}

function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter }: GlobalFilterProps) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div className='dark:invert pb-4 text-center items-center justify-center flex'>
      <label htmlFor='dashboardSearch'>
        <img src='/search.svg' className='mx-auto mr-3' />
      </label>
      <input
        id='dashboardSearch'
        name='dashboardSearch'
        className='form-control'
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        size={12}
      />
    </div>
  );
}

function compareWallets(rowA: any, rowB: any, id: any) {
  let a = '' + rowA.values[id];
  let b = '' + rowB.values[id];
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

function UserSection({ users }: UserSectionProps) {
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

interface UserDetailsModalProps {
  isOpen: boolean;
  toggle: (isOpen: boolean) => void;
  userData: any;
}

function UserDetailsModal({ isOpen, toggle, userData }: UserDetailsModalProps) {
  const { data: pointsBalance, isFetching: isFetchingPoints } = useGetPointsBalanceQuery(
    userData?.walletAddress,
    {
      skip: !userData,
    }
  );
  const lotteryIds = [], isFetchingLotteryIds = true;
  // const { data: lotteryIds, isFetching: isFetchingLotteryIds } = useGetParticipatingLotteryIdsQuery(
  //   userData?.walletAddress,
  //   {
  //     skip: !userData,
  //   }
  // );
  
const numTickets = 0, isFetchingTickets = true;
  // const { data: numTickets, isFetching: isFetchingTickets } = useGetNumUserEntriesTotalQuery(
  //   userData?.walletAddress,
  //   {
  //     skip: !userData,
  //   }
  // );

  return (
    <div>
      <Modal title='' isOpen={isOpen} closeModal={() => toggle(isOpen)}>
        <div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl'>
          <button onClick={() => toggle(isOpen)}>x</button>
          <div className='flex flex-col space-y-4 items-center'>
            {isFetchingPoints || isFetchingLotteryIds || isFetchingTickets ? (
              <Loader type='ThreeDots' color='black' height={10} width={50} timeout={0} />
            ) : (
              <div className='text-center'>
                <div className='mx-auto relative sm:w-20 sm:h-20 w-20 h-20 overflow-hidden rounded-full shadow-md bg-white border-1'>
                  <img src={userData?.profilePicture || '/sample/pfp.svg'} className='mx-auto' />
                </div>
                <div className='mt-2 font-bold'>{userData?.username}</div>
                <div>{userData?.email}</div>
                <div className='italic'>{userData?.bio}</div>
                <div className='font-mono'>{userData?.walletAddress}</div>
                <div className='mt-4 items-center flex justify-center space-x-8'>
                  <div>
                    <img src='/pineapple.svg' width='25' className='mx-auto' />
                    <div className='font-bold'>{userData?.EarnedPoints.totalPointsEarned}</div>
                    <div className='text-xs'>earned</div>
                  </div>
                  <div>
                    <img src='/pineapple.svg' width='25' className='mx-auto' />
                    <div className='font-bold'>{pointsBalance}</div>
                    <div className='text-xs'>balance</div>
                  </div>
                  <div>
                    <img src='/drop.svg' width='25' className='mx-auto' />
                    <div className='font-bold'>{lotteryIds?.length}</div>
                    <div className='text-xs'>lotteries</div>
                  </div>
                  <div>
                    <img src='/ticket.svg' width='25' className='mx-auto' />
                    <div className='font-bold'>{numTickets}</div>
                    <div className='text-xs'>tickets</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
