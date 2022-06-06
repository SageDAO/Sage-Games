import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { GamePanel } from './GamePanel';
import { UserPanel } from './UserPanel';

export function DashBoardPage() {
  return (
    <div className='dashboard-page'>
      <div className='dashboard-tab__container'>
        <Tab.Group as='div' className='dashboard-tab__group'>
          <Tab.List as='div' className='dashboard-tab__list'>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`dashboard-tab__button${selected && '--active'}`}>
                  New Drops
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`dashboard-tab__button${selected && '--active'}`}>Games</button>
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
              <GamePanel />
            </Tab.Panel>
            <Tab.Panel as='div' className='dashboard-tab__panel'>
              <GamePanel />
            </Tab.Panel>
            <Tab.Panel as='div' className='dashboard-tab__panel'>
              <UserPanel />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
