import { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BeakerIcon, CashIcon, ClipboardListIcon, CloudUploadIcon, TicketIcon } from '@heroicons/react/solid';
import { Tab1_DropDetails } from './Tab1_DropDetails';
import { Tab2_SalesSplits } from './Tab2_SalesSplits';
import { Tab3_Drawings } from './Tab3_Drawings';
import { Tab4_Auctions } from './Tab4_Auctions';
import { Tab5_Review } from './Tab5_Review';
import { populateWithTestData } from './_populate';

export function DropBuilder() {
  const [formData, setFormData] = useState({ drawingGames: [], auctionGames: [] });

  return (
    <div className='container-lg mt-5'>
      <h1>
        <BeakerIcon width={24} onClick={populateWithTestData} className='mx-2' />
        SAGE Drop Builder
      </h1>
      <Tabs forceRenderTabPanel={true} className='mt-5'>
        <TabList>
          <Tab>
            <ClipboardListIcon width={20} className='mx-1' /> Drop Details
          </Tab>
          <Tab disabled={true}>
            <CashIcon width={20} className='mx-1' />
            Sales &amp; Splits
          </Tab>
          <Tab>
            <TicketIcon width={20} className='mx-1' />
            Drawing Games
          </Tab>
          <Tab>
            <img src='/icon_auction_solid.svg' width={20} className='mx-1' alt='' />
            Auction Games
          </Tab>
          <Tab>
            <CloudUploadIcon width={20} className='mx-1' />
            Review &amp; Submit
          </Tab>
        </TabList>
        <TabPanel>
          <Tab1_DropDetails formData={formData} setFormData={setFormData} />
        </TabPanel>
        <TabPanel>
          <Tab2_SalesSplits formData={formData} setFormData={setFormData} />
        </TabPanel>
        <TabPanel>
          <Tab3_Drawings formData={formData} setFormData={setFormData} />
        </TabPanel>
        <TabPanel>
          <Tab4_Auctions formData={formData} setFormData={setFormData} />
        </TabPanel>
        <TabPanel>
          <Tab5_Review formData={formData} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
