import { LotteryStats } from '@/store/services/dashboardReducer';
import { Tab } from '@headlessui/react';
import { User } from '@prisma/client';
import { Fragment } from 'react';
import { LotterySection } from './LotterySection';
import { UserSection } from './UserSection';

interface Props {
  lotteriesStats: LotteryStats[];
  users: User[];
}

export function DashBoardPage({ lotteriesStats, users }: Props) {
  return (
    <div className='dashboard-page'>
      <div className='dashboard-tab__container'>
        <Tab.Group as='div' className='dashboard-tab__group'>
          <Tab.List as='div' className='dashboard-tab__list'>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`dashboard-tab__button${selected && '--active'}`}>
                  Lotteries
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`dashboard-tab__button${selected && '--active'}`}>Users</button>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels as='div' className='dashboard-tab__panels'>
            <Tab.Panel as='div' className='dashboard-tab__panel'>
              <LotterySection lotteriesStats={lotteriesStats} />
            </Tab.Panel>
            <Tab.Panel as='div' className='dashboard-tab__panel'>
              <UserSection users={users} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
