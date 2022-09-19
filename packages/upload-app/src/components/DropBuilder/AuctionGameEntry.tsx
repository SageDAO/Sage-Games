import { useState } from 'react';
import { CalendarIcon, CurrencyDollarIcon, DocumentTextIcon, PhotographIcon } from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import { format as formatDate } from 'date-fns';

type Props = {
  index: number; // index of this entry on parent array
  data: any; // auction entry data
  onDelete: (index: number) => void; // callback for when user deletes this entry
  onFieldChange: (index: number, name: string, value: any) => void; // callback to update global form data upon field change
};

export const AuctionGameEntry = ({ ...props }: Props) => {

  interface State {
    startDate: Date | null;
    endDate: Date | null;
  }

  const [state, setState] = useState<State>({ startDate: null, endDate: null }); // used by datepicker component

  const setStartDate = (d: Date) => {
    setState({ ...state, startDate: d });
    setDateFieldAsTimestamp('startDate', d);
  };

  const setEndDate = (d: Date) => {
    setState({ ...state, endDate: d });
    setDateFieldAsTimestamp('endDate', d);
  };

  const handleFieldChange = (e: any) => {
    props.onFieldChange(props.index, e.target.name, e.target.value);
  };

  // const onTagsChange = (newValue: string) => {
  //   props.onFieldChange(props.index, 'tags', newValue);
  // };

  const setDateFieldAsTimestamp = (name: string, d: Date) => {
    if (d) {
      props.onFieldChange(props.index, name, Math.floor(d.getTime() / 1000).toString());
    }
  };

  return (
    <table cellPadding={10}>
      <tbody>
        <tr>
          <td width='15%' style={{ verticalAlign: 'middle' }}>{props.data.previewJSX}</td>
          <td width='35%'>
            <label>
              <PhotographIcon width='20' style={{ marginRight: 5 }} />
              NFT Name *
            </label>
            <input
              type='text'
              className='form-control'
              name='name'
              onChange={handleFieldChange}
              value={props.data.name}
            />
            <label className='mt-3'>
              <CalendarIcon width='20' style={{ marginRight: 5 }} />
              Start Date *
            </label>
            <DatePicker
              placeholderText='Click to select a date'
              minDate={new Date()}
              onChange={setStartDate}
              showTimeSelect
              className='form-control'
              value={state.startDate ? formatDate(state.startDate.getTime(), 'MM/dd/yyyy hh:mm aa') : ''}
            />
            <label className='mt-3'>
              <CalendarIcon width='20' style={{ marginRight: 5 }} />
              End Date *
            </label>
            <DatePicker
              placeholderText='Click to select a date'
              minDate={state.startDate || new Date()}
              onChange={setEndDate}
              showTimeSelect
              className='form-control'
              value={state.endDate ? formatDate(state.endDate.getTime(), 'MM/dd/yyyy hh:mm aa') : ''}
            />
          </td>
          <td width='35%'>
            <label>
              <CurrencyDollarIcon width='20' style={{ marginRight: 5 }} />
              Minimum ASH Price *
            </label>
            <input
              type='text'
              className='form-control'
              name='minPrice'
              onChange={handleFieldChange}
              value={props.data.minPrice}
            />
            <label className='mt-3'>
              <DocumentTextIcon width='20' style={{ marginRight: 5 }} />
              Description
            </label>
            <textarea
              className='form-control md-textarea'
              name='description'
              rows={3}
              onChange={handleFieldChange}
              value={props.data.description}
            />
          </td>
          <td width='15%' style={{ verticalAlign: 'middle' }}>
            <button className='btn btn-outline-danger' onClick={() => props.onDelete(props.index)}>
              Delete Game
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};