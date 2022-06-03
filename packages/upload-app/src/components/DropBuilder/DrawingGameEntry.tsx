import { useState } from 'react';
import {
  CalendarIcon,
  ColorSwatchIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import { format as formatDate } from 'date-fns';
import { DrawingGameNftEntry } from './DrawingGameNftEntry';

type Props = {
  formData: any;
  setFormData: (formData: any) => void;
  index: number; // index of this entry on parent array
  data: any; // entry data
  onDelete: (index: number) => void; // callback for when user deletes this entry
  onFieldChange: (index: number, name: string, value: any) => void; // callback to update form data upon field change
};

export const DrawingGameEntry = ({ ...props }: Props) => {
  const [startDate, setStateStartDate] = useState<Date | null>(null);
  const [endDate, setStateEndDate] = useState<Date | null>(null);
  const handleAddNftEntryClick = () => {
    document.getElementById(`nftInputFile_${props.index}`).click();
  };

  const handleHiddenInputFileChange = (e: React.ChangeEvent<HTMLInputElement>, srcIndex: number) => {
    if (!e.target.files?.length) return;
    const newNftEntry = { nftFile: e.target.files[0] };
    const updatedGameArray = [...props.formData.drawingGames];
    updatedGameArray[srcIndex].nfts.push(newNftEntry);
    props.setFormData((prevData: any) => ({ ...prevData, drawingGames: updatedGameArray }));
  };

  const handleDeleteNftEntryClick = (delIndex: number) => {
    let updatedNftArray = props.formData.drawingGames[props.index].nfts.filter(
      (_: any, nftIndex: number) => nftIndex != delIndex
    );
    const updatedGameArray = [...props.formData.drawingGames];
    updatedGameArray[props.index].nfts = updatedNftArray;
    props.setFormData((prevData: any) => ({ ...prevData, drawingGames: updatedGameArray }));
  };

  const handleFieldChange = (e: any) => {
    const val = e.target.hasOwnProperty('checked') ? e.target.checked.toString() : e.target.value;
    props.onFieldChange(props.index, e.target.name, val);
  };

  const handleNftFieldChange = (nftIndex: number, name: string, value: any) => {
    let updatedGameArray = [...props.formData.drawingGames];
    updatedGameArray[props.index].nfts[nftIndex][name] = value;
    props.setFormData((prevData: any) => ({ ...prevData, drawingGames: updatedGameArray }));
  };

  const setStartDate = (d: Date) => {
    setStateStartDate(d);
    setDateFieldAsTimestamp('startDate', d);
  };

  const setEndDate = (d: Date) => {
    setStateEndDate(d);
    setDateFieldAsTimestamp('endDate', d);
  };

  const setDateFieldAsTimestamp = (name: string, d: Date) => {
    if (d) {
      props.onFieldChange(props.index, name, Math.floor(d.getTime() / 1000).toString());
    }
  };

  return (
    <div className='container-lg px-4'>
      <input
        type='file'
        id={`nftInputFile_${props.index}`}
        style={{ display: 'none' }}
        accept='image/png, image/gif, image/jpeg, video/mp4'
        multiple={false}
        onChange={(e) => handleHiddenInputFileChange(e, props.index)}
      />
      <br />
      <div className='row'>
        <div className='col'>
          <label>
            <CalendarIcon width='20' style={{ marginRight: 5 }} />
            Start Date *
          </label>
          <DatePicker
            id='drawingStartDate'
            selected={startDate}
            placeholderText='Click to select a date'
            minDate={new Date()}
            onChange={setStartDate}
            showTimeSelect
            className='form-control'
            value={props.data.startDate ? formatDate(+props.data.startDate * 1000, 'MM/dd/yyyy hh:mm aa') : ''}
          />
        </div>
        <div className='col'>
          <label>
            <CalendarIcon width='20' style={{ marginRight: 5 }} />
            End Date *
          </label>
          <DatePicker
            id='drawingEndDate'
            selected={endDate}
            placeholderText='Click to select a date'
            minDate={new Date()}
            onChange={setEndDate}
            showTimeSelect
            className='form-control'
            value={props.data.endDate ? formatDate(+props.data.endDate * 1000, 'MM/dd/yyyy hh:mm aa') : ''}
          />
        </div>
        <div className='col'>
          <label>
            <CurrencyDollarIcon width='20' style={{ marginRight: 5 }} />
            Ticket Cost (Tokens) *
          </label>
          <input
            type='text'
            className='form-control'
            name='ticketCostTokens'
            id='ticketCostTokens'
            onChange={handleFieldChange}
            value={props.data.ticketCostTokens}
          />
        </div>
        <div className='col'>
          <label>
            <StarIcon width='20' style={{ marginRight: 5 }} />
            Ticket Cost (Points) *
          </label>
          <input
            type='text'
            className='form-control'
            name='ticketCostPoints'
            id='ticketCostPoints'
            onChange={handleFieldChange}
            value={props.data.ticketCostPoints}
          />
        </div>
      </div>

      <div className='row mt-4 mb-5'>
        <div className='col'>
          <label>
            <ColorSwatchIcon width='20' style={{ marginRight: 5 }} />
            Max Tickets
          </label>
          <input
            type='number'
            name='maxTickets'
            id='maxTickets'
            className='form-control'
            onChange={handleFieldChange}
            value={props.data.maxTickets}
          />
        </div>
        <div className='col'>
          <label>
            <UserGroupIcon width='20' style={{ marginRight: 5 }} />
            Max Tickets per User
          </label>
          <input
            type='number'
            name='maxTicketsPerUser'
            id='maxTicketsPerUser'
            className='form-control'
            onChange={handleFieldChange}
            value={props.data.maxTicketsPerUser}
          />
        </div>
        <div className='col'>
          <label>
            <ReceiptRefundIcon width='20' style={{ marginRight: 5 }} />
            Refundable
            <input
              type='checkbox'
              name='isRefundable'
              style={{ marginLeft: 10, verticalAlign: 'middle' }}
              onChange={handleFieldChange}
              checked={'true' == props.data.isRefundable}
            />
          </label>
        </div>
        <div className='col'></div>
      </div>

      {props.formData.drawingGames[props.index].nfts.map((nft: any, i: number) => (
        <DrawingGameNftEntry
          key={i}
          drawingIndex={props.index}
          nftIndex={i}
          data={nft}
          onDelete={handleDeleteNftEntryClick}
          onFieldChange={handleNftFieldChange}
        />
      ))}

      <div className='row mt-3 mb-5 text-center align-middle'>
        <div className='col text-center align-middle'>
          <button className='btn btn-outline-dark' onClick={handleAddNftEntryClick}>
            + Add NFT
          </button>
        </div>
        <div className='col'></div>
        <div className='col'>
          <button className='btn btn-outline-danger' onClick={() => props.onDelete(props.index)}>
            Delete Game
          </button>
        </div>
      </div>
    </div>
  );
};