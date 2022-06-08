import {
    DocumentTextIcon,
    FolderIcon,
    LocationMarkerIcon,
    PencilAltIcon,
    PhotographIcon,
    TagIcon,
} from "@heroicons/react/outline";

type Props = {
    formData: any;
    setFormData: (formData: any) => void;
};

export const Tab1_DropDetails = ({ ...props }: Props) => {
    const handleBannerFileChange = (e: any) => {
        if (!e.target.files?.length) return;
        props.setFormData((prevData: any) => ({ ...prevData, bannerImageFile: e.target.files[0] }));
    };

    const handleFieldChange = (e: any) => {
        const { name, value } = e.target;
        props.setFormData((prevData: any) => ({ ...prevData, [name]: value }));
    };

    const handleWhitelistSelectChange = (e: any) => {
        const isNewEntry = "new" == e.target.value;
        let newEntryDiv = document.getElementById("newWhitelistEntryDiv");
        if (newEntryDiv) {
            newEntryDiv.style.display = isNewEntry ? "inline" : "none";
        }
        handleFieldChange(e);
    };

    return (
        <div className="mt-4 container-lg px-4">
            <div className="row">
                <div className="col">
                    <label>
                        <LocationMarkerIcon width="20" style={{ marginRight: 5 }} />
                        Target System *
                    </label>
                    <select className="form-select py-0" name="target" id="target" onChange={handleFieldChange}>
                        <option value=""> -- Select -- </option>
                        <option value="localhost">Dev Localhost</option>
                        <option value="SAGE Dev">SAGE Dev</option>
                        {/* <option value="SAGE Staging">SAGE Staging</option>
                        <option value="SAGE Production">SAGE Production</option> */}
                    </select>
                </div>
                <div className="col">
                    <label>
                        <FolderIcon width="20" style={{ marginRight: 5 }} />
                        Drop Name *
                    </label>
                    <input type="text" className="form-control" name="name" id="name" onChange={handleFieldChange} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>
                        <PencilAltIcon width="20" style={{ marginRight: 5 }} />
                        Artist Wallet Address *
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="artistWallet"
                        id="artistWallet"
                        onChange={handleFieldChange}
                    />
                </div>
                <div className="col">
                    <label>
                        <TagIcon width="20" style={{ marginRight: 5 }} />
                        Tags
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="tags"
                        id="tags"
                        placeholder="tag1 tag2 tag3"
                        onChange={handleFieldChange}
                    />
                </div>
            </div>

            <label className="mt-4">
                <DocumentTextIcon width="20" style={{ marginRight: 5 }} />
                Description
            </label>
            <textarea
                className="form-control md-textarea"
                name="description"
                id="description"
                rows={2}
                placeholder=""
                onChange={handleFieldChange}
            />

            {/*
      <label className="mt-2">
        <HandIcon width="20" style={{ marginRight: 5 }} />
        Whitelist
      </label>
      <select className="form-select py-0" name="whitelist" onChange={handleWhitelistSelectChange}>
        <option value="none">None</option>
        <option value="new">Create New</option>
      </select>

      <div className="row mt-2" id="newWhitelistEntryDiv" style={{ display: "none" }}>
        <div className="col">
          <label>
            <HandIcon width="20" style={{ marginRight: 5 }} />
            Whitelist Entry Name *
          </label>
          <input type="text" className="form-control" name="whitelistNewEntryName" onChange={handleFieldChange} />
        </div>
        <div className="col">
          <label>
            <HomeIcon width="20" style={{ marginRight: 5 }} />
            Whitelist Token Address *
          </label>
          <input type="text" className="form-control" name="whitelistNewEntryToken" onChange={handleFieldChange} />
        </div>
        <div className="col">
          <label>
            <ClipboardCheckIcon width="20" style={{ marginRight: 5 }} />
            Minimum Balance *
          </label>
          <input type="text" className="form-control" name="whitelistNewEntryMinBalance" onChange={handleFieldChange} />
        </div>
      </div>
      */}

            <label className="mt-4">
                <PhotographIcon width="20" style={{ marginRight: 5 }} />
                Home Page Banner Image *
            </label>
            <input
                type="file"
                className="form-control form-control-sm form-control-file"
                name="bannerImageFile"
                onChange={handleBannerFileChange}
            />
        </div>
    );
};
