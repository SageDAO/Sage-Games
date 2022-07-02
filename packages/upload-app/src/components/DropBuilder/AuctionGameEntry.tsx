import { useEffect, useState } from "react";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  CursorClickIcon,
  DocumentTextIcon,
  PhotographIcon,
  TagIcon,
  TrendingUpIcon,
} from "@heroicons/react/outline";
import DatePicker from "react-datepicker";
import { format as formatDate } from "date-fns";

type Props = {
  index: number; // index of this entry on parent array
  data: any; // entry data
  onDelete: (index: number) => void; // callback for when user deletes this entry
  onFieldChange: (index: number, name: string, value: any) => void; // callback to update form data upon field change
};

export const AuctionGameEntry = ({ ...props }: Props) => {
  const [startDate, setStateStartDate] = useState<Date>(); // state var used by datepicker component
  const [endDate, setStateEndDate] = useState<Date>(); // state var used by datepicker component

  useEffect(() => {
    const displayThumbnail = () => {
      const isVideo = props.data.nftFile.name.toLowerCase().endsWith("mp4");
      const targetId = (isVideo ? "auctionVidThumb_" : "auctionImgThumb_") + props.index;
      let e = document.getElementById(targetId);
      (e as HTMLImageElement | HTMLVideoElement).src = URL.createObjectURL(props.data.nftFile);
      e.style.display = "block";
      props.onFieldChange(props.index, "isVideo", isVideo.toString());
    };
    displayThumbnail(); // upon component load, display thumbnail preview of selected upload file
  }, [props.data.nftFile, props.index]);

  const handleFieldChange = (e: any) => {
    props.onFieldChange(props.index, e.target.name, e.target.value);
  };

  const setStartDate = (d: Date) => {
    setStateStartDate(d);
    setDateFieldAsTimestamp("startDate", d);
  };

  const setEndDate = (d: Date) => {
    setStateEndDate(d);
    setDateFieldAsTimestamp("endDate", d);
  };

  const setDateFieldAsTimestamp = (name: string, d: Date) => {
    if (d) {
      props.onFieldChange(props.index, name, Math.floor(d.getTime() / 1000).toString());
    }
  };

  return (
    <div className="container-lg mt-4 d-flex">
      <div>
        <img
          id={`auctionImgThumb_${props.index}`}
          className="border border-dark rounded mt-4"
          width={100}
          style={{ display: "none" }}
          alt=""
        />
        <video
          id={`auctionVidThumb_${props.index}`}
          autoPlay
          muted
          loop
          playsInline
          className="border border-dark rounded mt-4"
          width={100}
          style={{ display: "none" }}
        >
          <source id={`auctionVidThumb_${props.index}_src`} src="" type="video/mp4"></source>
        </video>
      </div>

      <div className="col-7 mx-4">
        <div className="row mt-2">
          <div className="col">
            <label>
              <PhotographIcon width="20" style={{ marginRight: 5 }} />
              NFT Name *
            </label>
            <input
              type="text"
              className="form-control"
              name="name"
              onChange={handleFieldChange}
              value={props.data.name}
            />
          </div>
          <div className="col-7">
            <label>
              <TagIcon width="20" style={{ marginRight: 5 }} />
              Tags
            </label>
            <input
              type="text"
              className="form-control"
              name="tags"
              placeholder="tag1 tag2 tag3"
              onChange={handleFieldChange}
              value={props.data.tags}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col">
            <label>
              <CalendarIcon width="20" style={{ marginRight: 5 }} />
              Start Date *
            </label>
            <DatePicker
              selected={startDate}
              placeholderText="Click to select a date"
              minDate={new Date()}
              onChange={setStartDate}
              showTimeSelect
              className="form-control"
              value={props.data.startDate ? formatDate(+props.data.startDate * 1000, "MM/dd/yyyy hh:mm aa") : ""}
            />
            <label className="mt-3">
              <CalendarIcon width="20" style={{ marginRight: 5 }} />
              End Date *
            </label>
            <DatePicker
              selected={endDate}
              placeholderText="Click to select a date"
              minDate={startDate || new Date()}
              onChange={setEndDate}
              showTimeSelect
              className="form-control"
              value={props.data.endDate ? formatDate(+props.data.endDate * 1000, "MM/dd/yyyy hh:mm aa") : ""}
            />
          </div>
          <div className="col-7">
            <label className="mt-2">
              <DocumentTextIcon width="20" style={{ marginRight: 5 }} />
              Description
            </label>
            <textarea
              className="form-control md-textarea"
              name="description"
              rows={2}
              onChange={handleFieldChange}
              value={props.data.description}
            />
          </div>
        </div>
      </div>

      <div className="col">
        <div className="row">
          <div className="col">
            <label className="mt-2">
              <TrendingUpIcon width="20" style={{ marginRight: 5 }} />
              Minimum Price *
            </label>
            <input
              type="text"
              className="form-control"
              name="minPrice"
              onChange={handleFieldChange}
              value={props.data.minPrice}
            />
          </div>
        </div>
      </div>

      <div className="m-4 text-center my-auto">
        <button className="btn btn-outline-danger" onClick={() => props.onDelete(props.index)}>
          Delete Game
        </button>
      </div>
    </div>
  );
};
