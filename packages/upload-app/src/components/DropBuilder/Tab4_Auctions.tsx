import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { AuctionGameEntry } from './AuctionGameEntry';

type Props = {
  formData: any;
  setFormData: (formData: any) => void;
};

export function Tab4_Auctions({ ...props }: Props) {
  const handleAddGameClick = () => {
    document.getElementById('auctionInputFile').click();
  };

  const handleHiddenInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newGame = { nftFile: e.target.files[0] };
    props.setFormData((prevData: any) => ({ ...prevData, auctionGames: [...props.formData.auctionGames, newGame] }));
  };

  const handleDeleteGameClick = (delIndex: number) => {
    props.setFormData((prevData: any) => ({
      ...prevData,
      auctionGames: props.formData.auctionGames.filter((_: any, index: number) => index != delIndex),
    }));
  };

  const handleFieldChange = (srcIndex: number, name: string, value: any) => {
    let updatedGameArray = props.formData.auctionGames.map((game: any, index: number) =>
      index === srcIndex ? { ...game, [name]: value } : game
    );
    props.setFormData((prevData: any) => ({ ...prevData, auctionGames: updatedGameArray }));
  };

  return (
    <div className='container-lg mt-5 px-5'>
      <input
        type='file'
        id='auctionInputFile'
        style={{ display: 'none' }}
        accept='image/png, image/gif, image/jpeg, video/mp4'
        multiple={false}
        onChange={handleHiddenInputFileChange}
      />
      <Tabs forceRenderTabPanel={true}>
        <TabList>
          {props.formData.auctionGames.map((_: any, i: number) => {
            return (
              <Tab key={i}>
                <img src='/icon_auction_outline.svg' width={20} className='mx-1' alt='' />
                Auction {i + 1}
              </Tab>
            );
          })}
          <Tab onClick={handleAddGameClick}>+ Add Auction Game</Tab>
        </TabList>
        {props.formData.auctionGames.map((auction: any, i: number) => {
          return (
            <TabPanel key={i}>
              <AuctionGameEntry
                index={i}
                data={auction}
                onDelete={handleDeleteGameClick}
                onFieldChange={handleFieldChange}
              />
            </TabPanel>
          );
        })}
        <TabPanel></TabPanel>
      </Tabs>
    </div>
  );
}
