import { LotteryStats } from '@/store/services/_deprecated-dashboard';
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
