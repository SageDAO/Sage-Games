import { Fragment } from 'react';
import { GamePanel } from './GamePanel';
import { UserPanel } from './UserPanel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export function DashBoardPage() {
  return (
    <div className='dashboard-page'>
      <Tabs>
        <TabList>
          <Tab>New Drops</Tab>
          <Tab>Games</Tab>
          <Tab>Users</Tab>
        </TabList>
        <TabPanel className='dashboard-panel'>
          <GamePanel />
        </TabPanel>
        <TabPanel className='dashboard-panel'>
          <GamePanel />
        </TabPanel>
        <TabPanel className='dashboard-panel'>
          <UserPanel />
        </TabPanel>
      </Tabs>
    </div>
  );
}
