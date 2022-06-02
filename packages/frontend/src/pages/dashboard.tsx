import React from 'react';
import { Role, User } from '@prisma/client';
import Loader from 'react-loader-spinner';
import {
  LotteryStats,
  useGetAllUsersAndEarnedPointsQuery,
  useGetLotteriesStatsQuery,
} from '@/store/services/dashboardReducer';
import { useGetUserQuery } from '@/store/services/user';
import { DashBoardPage } from '@/components/Dashboard/DashboardPage';

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
      <div style={{ margin: '25px' }}>
        <br />
        <Loader type='ThreeDots' color='white' height={10} width={50} timeout={0} />
      </div>
    );
  }
  if (!isAdmin(user)) {
    return <div style={{ margin: '25px' }}>Please connect with an admin wallet</div>;
  }
  if (lotteryError || usersError) {
    return <div style={{ margin: '25px' }}>Oops, an error occured</div>;
  }

  return <DashBoardPage lotteriesStats={lotteryData as LotteryStats[]} users={users as User[]} />;
}