import { toast } from 'react-toastify';
import { BookOpenIcon, CloudUploadIcon, CogIcon, DatabaseIcon, PhotographIcon } from '@heroicons/react/outline';
import { targetConfig } from './config';
import { TaskStatus, ToastContent } from '../components/ToastContent';
import { createBucketName, uploadFileToS3Bucket } from '../utilities/awsS3';
import { copyFromS3toArweave, createNftMetadataOnArweave } from '../utilities/arweave';

var assert = require('assert');
var endpoint = null;

export async function handleDropUpload(data: any, setCurrentProgressPercent: (pct: number) => void) {
  // const dataCopy = structuredClone(data);
  console.log(`handleDropUpload() :: target = ${data.target}`);
  endpoint = targetConfig[data.target].ENDPOINT_URL;
  console.log(`handleDropUpload() :: endpoint = ${endpoint}`);
  const tasks = [
    { icon: <CloudUploadIcon />, funct: uploadMediaFilesToS3Bucket, desc: 'Uploading media files to S3 bucket' },
    { icon: <PhotographIcon />, funct: uploadNftMediaFilesToArweave, desc: 'Uploading NFT files to Arweave' },
    { icon: <BookOpenIcon />, funct: uploadNftMetadataFilesToArweave, desc: 'Uploading metadata to Arweave' },
    { icon: <DatabaseIcon />, funct: dbInsertDrop, desc: 'Inserting drop in database' },
    { icon: <CogIcon />, funct: dbInsertAuctionGames, desc: 'Creating auction games' },
    { icon: <CogIcon />, funct: dbInsertDrawingGames, desc: 'Creating drawing games' },
  ];
  await runTasks(tasks, data, setCurrentProgressPercent);
  toast.success(`Success! Drop created with id ${data.dropId}`);
  playSoundFile('/chime.mp3');
}

function copy(aObject: any): any {
  let bObject = Array.isArray(aObject) ? [] : {};
  let value: any;
  for (const key in aObject) {
    value = aObject[key];
    bObject[key] = (typeof value === "object") ? copy(value) : value;
  }
  return bObject;
}

async function runTasks(tasks: any, data: any, setCurrentProgressPercent: (pct: number) => void) {
  var progress: number = 0;
  setCurrentProgressPercent(progress);
  try {
    const stepIncrementPercent = 100.0 / tasks.length;
    for (const [i, task] of tasks.entries()) {
      await runTask(task.icon, task.desc, task.funct, [data]);
      progress = Math.ceil((i + 1) * stepIncrementPercent);
      setCurrentProgressPercent(progress);
    }
  } catch (e) {
    if (progress > 0) {
      setCurrentProgressPercent(progress * -1); // negative denotes an error and will turn the progress bar red
    }
    throw e;
  }
}

function initTaskToast(icon: JSX.Element, toastMsg: string): number | string {
  let toastId = toast(<ToastContent icon={icon} toastMsg={toastMsg} status={TaskStatus.RUNNING} />);
  return toastId;
}

function updateTaskToast(toastId: number | string, icon: JSX.Element, toastMsg: string, status: TaskStatus) {
  toast.update(toastId, {
    hideProgressBar: false,
    autoClose: 4000,
    render: <ToastContent icon={icon} toastMsg={toastMsg} status={status} />,
  });
}

async function runTask(icon: JSX.Element, toastMsg: string, callback: any, args: any[]) {
  let toastId = initTaskToast(icon, toastMsg);
  try {
    await callback.apply(null, args);
    updateTaskToast(toastId, icon, toastMsg, TaskStatus.FINISHED);
  } catch (e) {
    console.log(e);
    updateTaskToast(toastId, icon, toastMsg, TaskStatus.ERROR);
    toast.error("Error uploading drop, please check your browser's console for more details");
    throw e;
  }
}

async function uploadMediaFilesToS3Bucket(data: any) {
  console.log(`uploadMediaFilesToS3Bucket()`);
  const createFilename = (counter: number, sourceName: string) => {
    return `nft_${counter}.${sourceName.toLowerCase().split('.').pop()}`;
  };
  const bucketName = createBucketName();
  // Upload banner image
  let fileExtension = data.bannerImageFile.name.toLowerCase().split('.').pop();
  let filename = `banner.${fileExtension}`;
  data.bannerImageS3Path = await uploadFileToS3Bucket(endpoint, bucketName, filename, data.bannerImageFile);
  let nftFileCounter = 0;
  // Upload Auctions' NFT files
  for (const a of data.auctionGames) {
    a.nftFilename = createFilename(++nftFileCounter, a.nftFile.name);
    a.s3Path = await uploadFileToS3Bucket(endpoint, bucketName, a.nftFilename, a.nftFile);
  }
  // Upload Drawings' NFT files
  for (const d of data.drawingGames) {
    for (const nft of d.nfts) {
      nft.nftFilename = createFilename(++nftFileCounter, nft.nftFile.name);
      nft.s3Path = await uploadFileToS3Bucket(endpoint, bucketName, nft.nftFilename, nft.nftFile);
    }
  }
}

async function uploadNftMediaFilesToArweave(data: any) {
  console.log(`uploadNftMediaFilesToArweave()`);
  // Upload Auctions' NFT files
  for (const [i, auction] of data.auctionGames.entries()) {
    auction.ipfsPath = await copyFromS3toArweave(endpoint, auction.s3Path);
    console.log(`uploadNftMediaFilesToArweave() :: Auction ${i + 1} NFT uploaded to ${auction.ipfsPath}`);
  }
  // Upload Drawings' NFT files
  for (const [i, drawing] of data.drawingGames.entries()) {
    for (const [j, nft] of drawing.nfts.entries()) {
      nft.ipfsPath = await copyFromS3toArweave(endpoint, nft.s3Path);
      console.log(`uploadNftMediaFilesToArweave() :: Drawing ${i + 1} NFT ${j + 1} uploaded to ${nft.ipfsPath}`);
    }
  }
}

async function uploadNftMetadataFilesToArweave(data: any) {
  console.log(`uploadNftMetadataFilesToArweave()`);
  // Upload Auctions' NFT files
  for (const auction of data.auctionGames) {
    auction.metadataPath = await _createNftMetadataOnArweave(auction);
  }
  // Upload Drawings' NFT files
  for (const drawing of data.drawingGames) {
    unfoldDrawingNfts(drawing);
    for (const nft of drawing.unfoldedNfts) {
      nft.metadataPath = await _createNftMetadataOnArweave(nft);
    }
  }
}

async function _createNftMetadataOnArweave(nft: any): Promise<string> {
  const isVideo = nft.nftFile.name.toLowerCase().endsWith('mp4');
  return await createNftMetadataOnArweave(endpoint, nft.name, nft.description, nft.ipfsPath, isVideo);
}

async function unfoldDrawingNfts(drawing: any) {
  const unfoldedNfts = [];
  for (let nft of drawing.nfts) {
    nft.drawingId = drawing.drawingId;
    if (nft.numberOfEditions > 1) {
      // Unfold each edition into a new NFT
      for (let i = 1; i <= nft.numberOfEditions; i++) {
        let nftEdition = { ...nft };
        if (nftEdition.description) {
          nftEdition.description += ` - ${i}/${nft.numberOfEditions}`;
        } else {
          nftEdition.description = `${i}/${nft.numberOfEditions}`;
        }
        unfoldedNfts.push(nftEdition);
      }
    } else {
      unfoldedNfts.push(nft);
    }
  }
  drawing.unfoldedNfts = unfoldedNfts;
}

//
// Database functions ==============================================================================================
//

async function dbInsertDrop(data: any) {
  console.log(`dbInsertDrop()`);
  const response = await postJSON(`${endpoint}?action=InsertDrop`, JSON.stringify(data, jsonReplacer));
  const { dropId, nftContractAddress, error } = await response.json();
  if (error) {
    console.log(error);
    throw new Error(error);
  }
  data.dropId = dropId;
  data.nftContractAddress = nftContractAddress;
  console.log(`dbInsertDrop() :: Drop ID = ${dropId}`);
}

async function dbInsertAuctionGames(data: any) {
  console.log(`dbInsertAuctionGames([${data.auctionGames.length}])`);
  assert(data.dropId && data.dropId != 0);
  for (const [i, auction] of data.auctionGames.entries()) {
    auction.dropId = data.dropId;
    const response = await postJSON(`${endpoint}?action=InsertAuction`, JSON.stringify(auction, jsonReplacer));
    const { auctionId, nftId, error } = await response.json();
    if (error) {
      console.log(error);
      throw new Error(error);
    }
    auction.auctionId = auctionId;
    auction.nftId = nftId;
    console.log(`dbInsertAuctionGames() :: Auction ${i + 1} ID = ${auctionId} NFT_ID = ${nftId}`);
  }
}

async function dbInsertNft(nftData: any) {
  const response = await postJSON(`${endpoint}?action=InsertNft`, JSON.stringify(nftData, jsonReplacer));
  const { nftId, error } = await response.json();
  if (error) {
    console.log(error);
    throw new Error(error);
  }
  nftData.nftId = nftId;
  console.log(`dbInsertNft('${nftData.nftFilename}') :: nftId = ${nftId}`);
}

async function dbInsertDrawingGames(data: any) {
  console.log(`dbInsertDrawingGames([${data.drawingGames.length}])`);
  assert(data.dropId);
  for (const [i, drawing] of data.drawingGames.entries()) {
    // Insert drawing
    drawing.dropId = data.dropId;
    const response = await postJSON(`${endpoint}?action=InsertDrawing`, JSON.stringify(drawing, jsonReplacer));
    const { drawingId, error } = await response.json();
    if (error) {
      console.log(error);
      throw new Error(error);
    }
    drawing.drawingId = drawingId;
    console.log(`dbInsertDrawingGames() :: Drawing ${i + 1} ID = ${drawingId}`);
    for (const nft of drawing.unfoldedNfts) {
      nft.drawingId = drawingId;
      await dbInsertNft(nft);
    }
  }
}

//
// Helper functions ================================================================================================
//

async function postJSON(url: string, json: string): Promise<Response> {
  return await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
  });
}

function playSoundFile(fileUrl: string) {
  try {
    new Audio(fileUrl).play();
  } catch (e) {}
}

/**
 * When stringifying to JSON, ignore File and preview objects
 */
function jsonReplacer(key: string, value: any) {
  if (key == 'preview') {
    return undefined;
  }
  return value instanceof File ? undefined : value;
}
