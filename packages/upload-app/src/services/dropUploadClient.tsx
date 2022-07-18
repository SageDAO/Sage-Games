import { toast } from 'react-toastify';
import { CloudUploadIcon, CogIcon, DatabaseIcon, PhotographIcon } from '@heroicons/react/outline';
import { targetConfig } from './config';
import { TaskStatus, ToastContent } from '../components/ToastContent/ToastContent';

var assert = require('assert');
var endpoint = null;

export async function handleDropUpload(data: any, setCurrentProgressPercent: (pct: number) => void) {
  const clonedData = structuredClone(data);
  console.log(`handleDropUpload() :: target = ${data.target}`);
  endpoint = targetConfig[data.target].ENDPOINT_URL;
  console.log(`handleDropUpload() :: endpoint = ${endpoint}`);
  const tasks = [
    { icon: <CloudUploadIcon />, funct: uploadMediaFilesToS3Bucket, desc: 'Uploading media files to S3 bucket' },
    { icon: <CloudUploadIcon />, funct: uploadNftMediaFilesToArweave, desc: 'Uploading NFT files to Arweave' },
    { icon: <DatabaseIcon />, funct: dbInsertDrop, desc: 'Inserting drop in database' },
    { icon: <CogIcon />, funct: dbInsertAuctionGames, desc: 'Creating auction games' },
    { icon: <CogIcon />, funct: dbInsertDrawingGames, desc: 'Creating drawing games' },
  ];
  await runTasks(tasks, clonedData, setCurrentProgressPercent);
  toast.success(`Success! Drop created with id ${clonedData.dropId}`);
  playSoundFile('/chime.mp3');
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

//
// AWS S3 Bucket functions =========================================================================================
//

async function uploadMediaFilesToS3Bucket(data: any) {
  console.log(`uploadMediaFilesToS3Bucket()`);
  const bucketName = Date.now().toString();
  // Upload banner image
  let fileExtension = data.bannerImageFile.name.toLowerCase().split('.').pop();
  let filename = `banner.${fileExtension}`;
  data.bannerImageS3Path = await uploadFileToS3Bucket(bucketName, filename, data.bannerImageFile);
  let nftFileCounter = 0;
  // Upload Auctions' NFT files
  for (const auction of data.auctionGames) {
    let fileExtension = auction.nftFile.name.toLowerCase().split('.').pop();
    let filename = `nft_${++nftFileCounter}.${fileExtension}`;
    auction.nftFilename = filename;
    auction.s3Path = await uploadFileToS3Bucket(bucketName, filename, auction.nftFile);
  }
  // Upload Drawings' NFT files
  for (const drawing of data.drawingGames) {
    for (const nft of drawing.nfts) {
      let fileExtension = nft.nftFile.name.toLowerCase().split('.').pop();
      let filename = `nft_${++nftFileCounter}.${fileExtension}`;
      nft.nftFilename = filename;
      nft.s3Path = await uploadFileToS3Bucket(bucketName, filename, nft.nftFile);
    }
  }
}

async function uploadFileToS3Bucket(bucket: string, filename: string, file: File): Promise<string> {
  console.log(`uploadFileToS3Bucket(bucket: ${bucket}, file: ${filename})`);
  let { uploadUrl, getUrl } = await fetchS3SignedUrl(bucket, filename);
  console.log(`uploadFileToS3Bucket() :: sending PUT request...`);
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  console.log(`uploadFileToS3Bucket() :: file uploaded to ${getUrl}`);
  return getUrl;
}

async function fetchS3SignedUrl(bucket: string, filename: string): Promise<any> {
  console.log(`fetchS3SignedUrl()`);
  const request = await fetch(`${endpoint}?action=CreateS3SignedUrl&bucket=${bucket}&filename=${filename}`);
  const response = await request.json();
  console.log(`fetchS3SignedUrl() :: ${response.uploadUrl}`);
  return response;
}

//
// Arweave functions ===============================================================================================
//

async function uploadNftMediaFilesToArweave(data: any) {
  console.log(`uploadNftMediaFilesToArweave()`);
  // Upload Auctions' NFT files
  for (const [i, auction] of data.auctionGames.entries()) {
    auction.ipfsPath = await copyFromS3toArweave(auction.s3Path);
    console.log(`uploadNftMediaFilesToArweave() :: Auction ${i + 1} NFT uploaded to ${auction.ipfsPath}`);
  }
  // Upload Drawings' NFT files
  for (const [i, drawing] of data.drawingGames.entries()) {
    for (const [j, nft] of drawing.nfts.entries()) {
      nft.ipfsPath = await copyFromS3toArweave(nft.s3Path);
      console.log(`uploadNftMediaFilesToArweave() :: Drawing ${i + 1} NFT ${j + 1} uploaded to ${nft.ipfsPath}`);
    }
  }
}

async function copyFromS3toArweave(s3Path: string): Promise<string> {
  const response = await fetch(`${endpoint}?action=CopyFromS3toArweave&s3Path=${s3Path}`);
  const { id, balance, error } = await response.json();
  if (error) {
    console.log(error);
    throw new Error(error);
  }
  console.log(`Arweave balance = ${balance}`);
  return `ar://${id}`;
}

function buildNftMetadata(item: any): string {
  // TODO: metadata for video files should be different, check https://docs.opensea.io/docs/metadata-standards
  return JSON.stringify({
    name: item.name,
    description: item.description,
    image: item.ipfsPath,
  });
}

async function createNftMetadataOnArweave(nft: any) {
  console.log('createNftMetadataOnArweave()');
  const metadata = JSON.stringify({ filename: nft.nftFilename, data: buildNftMetadata(nft) });
  const response = await postJSON(`${endpoint}?action=UploadNftMetadataToArweave`, metadata);
  const { id, balance, error } = await response.json();
  if (error) {
    console.log(error);
    throw new Error(error);
  }
  console.log(`createNftMetadataOnArweave() :: ${nft.nftFilename} metadata saved to ${id} (balance = ${balance})`);
  return id;
}

//
// Database functions ==============================================================================================
//

async function dbInsertDrop(data: any) {
  console.log(`dbInsertDrop()`);
  const response = await postJSON(`${endpoint}?action=InsertDrop`, JSON.stringify(data, ignoreFiles));
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
    const arweaveId = await createNftMetadataOnArweave(auction);
    auction.metadataPath = `https://arweave.net/${arweaveId}`;
    const response = await postJSON(`${endpoint}?action=InsertAuction`, JSON.stringify(auction, ignoreFiles));
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
  const response = await postJSON(`${endpoint}?action=InsertNft`, JSON.stringify(nftData, ignoreFiles));
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
    const response = await postJSON(`${endpoint}?action=InsertDrawing`, JSON.stringify(drawing, ignoreFiles));
    const { drawingId, error } = await response.json();
    if (error) {
      console.log(error);
      throw new Error(error);
    }
    drawing.drawingId = drawingId;
    console.log(`dbInsertDrawingGames() :: Drawing ${i + 1} ID = ${drawingId}`);
    // Insert NFTs
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
          const arweaveId = await createNftMetadataOnArweave(nftEdition);
          nftEdition.metadataPath = `https://arweave.net/${arweaveId}`;
          await dbInsertNft(nftEdition);
          unfoldedNfts.push(nftEdition);
        }
      } else {
        const arweaveId = await createNftMetadataOnArweave(nft);
        nft.metadataPath = `https://arweave.net/${arweaveId}`;
        await dbInsertNft(nft);
      }
    }
    // Replace single NFTs that have multiple editions by their unique unfolded pieces
    drawing.nfts = drawing.nfts.filter((item: any) => item.nftId);
    Array.prototype.push.apply(drawing.nfts, unfoldedNfts);
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
 * When stringifying to JSON, ignore File objects (as they contain binary data)
 */
function ignoreFiles(_: string, value: any) {
  return value instanceof File ? undefined : value;
}