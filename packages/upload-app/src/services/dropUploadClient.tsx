import { CloudUploadIcon, CogIcon, DatabaseIcon, KeyIcon, PhotographIcon, PuzzleIcon } from '@heroicons/react/outline';
import { NFTStorage } from 'nft.storage';
import { toast } from 'react-toastify';
import { targetConfig } from './config';
import { TaskStatus, ToastContent } from '../components/ToastContent/ToastContent';

var assert = require('assert');
var endpoint = null;

export async function handleDropUpload(data: any, setCurrentProgressPercent: (pct: number) => void) {
  console.log(`handleDropUpload() :: ${data.target}`);
  endpoint = targetConfig[data.target].ENDPOINT_URL;
  console.log(`handleDropUpload() :: endpoint set to ${endpoint}`);
  const tasks = [
    { icon: <KeyIcon />, funct: fetchNftStorageRequestToken, desc: 'Fetching storage request token' },
    { icon: <CloudUploadIcon />, funct: uploadMediaFilesToS3Bucket, desc: 'Uploading media files to S3 bucket' },
    { icon: <CloudUploadIcon />, funct: uploadNftFilesToIpfs, desc: 'Uploading media files to IPFS' },
    //{ icon: <CloudUploadIcon />, funct: uploadNftFilesToArweave, desc: 'Uploading NFT files to Arweave' },
    { icon: <DatabaseIcon />, funct: dbInsertDrop, desc: 'Inserting drop in database' },
    { icon: <CogIcon />, funct: dbInsertAuctionGames, desc: 'Inserting auction games in database' },
    { icon: <CogIcon />, funct: dbInsertDrawingGames, desc: 'Inserting drawing games in database' },
    { icon: <PhotographIcon />, funct: createNftsJsonsAndUploadToIpfs, desc: 'Creating NFTs in IPFS' },
    // { icon: <PhotographIcon />, funct: createNftsJsonsAndUploadToArweave, desc: 'Creating NFT metadata in Arweave' },
    { icon: <PuzzleIcon />, funct: dbUpdateMetadataCid, desc: "Updating drop's content identifier (CID)" },
  ];
  await runTasks(tasks, data, setCurrentProgressPercent);
  toast.success(`Success! Drop created with id ${data.dropId}`);
  playSuccessSound();
}

export function playSuccessSound() {
  playSoundFile('/chime.mp3');
}

function playSoundFile(fileUrl: string, volume?: number) {
  try {
    const audio = new Audio(fileUrl);
    if (volume) {
      audio.volume = volume;
    }
    audio.play();
  } catch (e) {
    // ignore
  }
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
      setCurrentProgressPercent(progress * -1); // negative denotes an error and will paint the progress bar red
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
    toast.error('Error uploading drop, please check browser console for more details');
    throw e;
  }
}

async function fetchNftStorageRequestToken(data: any) {
  console.log('fetchNftStorageRequestToken()');
  const request = await fetch(`${endpoint}?action=CreateNftStorageRequestToken`);
  const { token, error } = await request.json();
  if (token) {
    data.nftStorageToken = token;
    console.log(`fetchNftStorageRequestToken() :: ${token.substring(0, 10)}...`);
  } else if (error) {
    console.log(error);
    throw new Error(error);
  } else {
    throw new Error();
  }
}

async function uploadMediaFilesToS3Bucket(data: any) {
  console.log(`uploadMediaFilesToS3Bucket()`);
  const bucketName = Date.now().toString();
  // Upload banner image
  let fileExtension = data.bannerImageFile.name.split('.').pop();
  let filename = `banner.${fileExtension}`;
  data.bannerImageS3Path = await uploadFileToS3Bucket(bucketName, filename, data.bannerImageFile);
  let nftFileCounter = 0;
  // Upload Auctions' NFT files
  for (const auction of data.auctionGames) {
    let fileExtension = auction.nftFile.name.split('.').pop();
    let filename = `nft_${++nftFileCounter}.${fileExtension}`;
    auction.nftFilename = filename;
    auction.s3Path = await uploadFileToS3Bucket(bucketName, filename, auction.nftFile);
  }
  // Upload Drawings' NFT files
  for (const drawing of data.drawingGames) {
    for (const nft of drawing.nfts) {
      let fileExtension = nft.nftFile.name.split('.').pop();
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

async function uploadNftFilesToArweave(data: any) {
  console.log(`uploadNftFilesToArweave([${data.auctionGames.length} auctions, ${data.drawingGames.length} drawings])`);
  const copyFromS3toArweave = async (s3Path: string): Promise<string> => {
    const request = await fetch(`${endpoint}?action=CopyFromS3toArweave&s3Path=${s3Path}`);
    const response = await request.json();
    return response.arweavePath;
  };
  // Upload Auctions' NFT files
  for (const [i, auction] of data.auctionGames.entries()) {
    auction.ipfsPath = copyFromS3toArweave(auction.s3Path);
    console.log(`uploadNftFilesToArweave() :: Auction ${i + 1} NFT uploaded to ${auction.ipfsPath}`);
  }
  // Upload Drawings' NFT files
  for (const [i, drawing] of data.drawingGames.entries()) {
    for (const [j, nft] of drawing.nfts.entries()) {
      nft.ipfsPath = copyFromS3toArweave(nft.s3Path);
      console.log(`uploadNftFilesToArweave() :: Drawing ${i + 1} NFT ${j + 1} uploaded to ${nft.ipfsPath}`);
    }
  }
}

async function uploadNftFilesToIpfs(data: any) {
  console.log(`uploadNftFilesToIpfs([${data.auctionGames.length} auctions, ${data.drawingGames.length} drawings])`);
  const nftStorageClient = new NFTStorage({ token: data.nftStorageToken });
  // Upload Auctions' NFT files
  for (const [i, auction] of data.auctionGames.entries()) {
    let cid = await nftStorageClient.storeBlob(new Blob([auction.nftFile]));
    auction.ipfsPath = `https://${cid}.ipfs.dweb.link`;
    console.log(`uploadNftFilesToIpfs() :: Auction ${i + 1} NFT uploaded to ${auction.ipfsPath}`);
  }
  // Upload Drawings' NFT files
  for (const [i, drawing] of data.drawingGames.entries()) {
    for (const [j, nft] of drawing.nfts.entries()) {
      let cid = await nftStorageClient.storeBlob(new Blob([nft.nftFile]));
      nft.ipfsPath = `https://${cid}.ipfs.dweb.link`;
      console.log(`uploadNftFilesToIpfs() :: Drawing ${i + 1} NFT ${j + 1} uploaded to ${nft.ipfsPath}`);
    }
  }
}

/**
 * When stringifying to JSON, ignore files
 */
function ignoreFiles(_: string, value: any) {
  if (value instanceof File) {
    return undefined;
  }
  return value;
}

async function dbInsertDrop(data: any) {
  console.log(`dbInsertDrop()`);
  const response = await postJSON(`${endpoint}?action=InsertDrop`, JSON.stringify(data, ignoreFiles));
  const { dropId, error } = await response.json();
  if (dropId) {
    data.dropId = dropId;
    console.log(`dbInsertDrop() :: Drop ID = ${dropId}`);
  } else {
    console.log(error);
    throw new Error(error);
  }
}

async function dbInsertAuctionGames(data: any) {
  console.log(`dbInsertAuctionGames([${data.auctionGames.length}])`);
  assert(data.dropId && data.dropId != 0);
  for (const [i, auction] of data.auctionGames.entries()) {
    auction.dropId = data.dropId;
    const response = await postJSON(`${endpoint}?action=InsertAuction`, JSON.stringify(auction, ignoreFiles));
    const { auctionId, nftId, error } = await response.json();
    if (auctionId && nftId) {
      auction.auctionId = auctionId;
      auction.nftId = nftId;
      console.log(`dbInsertAuctionGames() :: Auction ${i + 1} ID = ${auctionId} NFT_ID = ${nftId}`);
    } else {
      console.log(error);
      throw new Error(error);
    }
  }
}

async function dbInsertNft(nftData: any) {
  const response = await postJSON(`${endpoint}?action=InsertNft`, JSON.stringify(nftData, ignoreFiles));
  const { nftId, error } = await response.json();
  if (nftId) {
    nftData.nftId = nftId;
    console.log(`dbInsertNft('${nftData.nftFilename}') :: nftId = ${nftId}`);
  } else {
    console.log(error);
    throw new Error(error);
  }
}

async function dbInsertDrawingGames(data: any) {
  console.log(`dbInsertDrawingGames([${data.drawingGames.length}])`);
  assert(data.dropId);
  for (const [i, drawing] of data.drawingGames.entries()) {
    // Insert drawing
    drawing.dropId = data.dropId;
    const response = await postJSON(`${endpoint}?action=InsertDrawing`, JSON.stringify(drawing, ignoreFiles));
    const { drawingId, error } = await response.json();
    if (drawingId) {
      drawing.drawingId = drawingId;
      console.log(`dbInsertDrawingGames() :: Drawing ${i + 1} ID = ${drawingId}`);
      const editionsInDrop = drawing.nfts.reduce((accum: number, nft: any) => accum + nft.numberOfEditions, 0);
      // Insert NFTs
      for (let nft of drawing.nfts) {
        nft.drawingId = drawing.drawingId;
        const probabilityOfPull = Number(((nft.numberOfEditions / editionsInDrop) * 100).toFixed(2));
        nft.rarity = `${nft.numberOfEditions} Edition${
          nft.numberOfEditions > 1 ? 's' : ''
        } | ${probabilityOfPull}% Chance`;
        await dbInsertNft(nft);
        if (nft.isDefaultPrize) {
          await updateDefaultDrawingPrize(drawing, nft);
        }
      }
    } else {
      console.log(error);
      throw new Error(error);
    }
  }
}

async function updateDefaultDrawingPrize(drawing: any, nft: any) {
  console.log(`updateDefaultDrawingPrize(${drawing.drawingId}, ${nft.nftId})`);
  await postJSON(
    `${endpoint}?action=UpdateDefaultPrize`,
    JSON.stringify({ drawingId: drawing.drawingId, nftId: nft.nftId })
  );
}

async function createNftsJsonsAndUploadToIpfs(data: any) {
  console.log('createNftsJsonsAndUploadToIpfs()');
  const nftStorageClient = new NFTStorage({ token: data.nftStorageToken });
  var nftFiles: File[] = Array();
  // Add auction NFTs to content
  for (let auction of data.auctionGames) {
    const jsonData = JSON.stringify({
      name: auction.name,
      description: auction.description,
      image: auction.ipfsPath,
    });
    const jsonFile = new File([jsonData], auction.nftId.toString(), { type: 'application/json' });
    nftFiles.push(jsonFile);
  }
  // Add drawing NFTs to content
  for (let drawing of data.drawingGames) {
    for (let nft of drawing.nfts) {
      const jsonData = JSON.stringify({
        name: nft.name,
        description: nft.description,
        image: nft.ipfsPath,
      });
      const jsonFile = new File([jsonData], nft.nftId.toString(), { type: 'application/json' });
      nftFiles.push(jsonFile);
    }
  }
  data.dropMetadataCid = await nftStorageClient.storeDirectory(nftFiles);
  console.log(`createNftsJsonsAndUploadToIpfs() :: CID = ${data.dropMetadataCid}`);
}

async function createNftsJsonsAndUploadToArweave(data: any) {
  console.log('createNftsJsonsAndUploadToArweave()');
  // TODO Content has a unique CID on IPFS; verify if Arweave will work the same way
  const nftStorageClient = new NFTStorage({ token: data.nftStorageToken });
  var nftFiles: File[] = Array();
  // Add auction NFTs to content
  for (let auction of data.auctionGames) {
    const jsonData = JSON.stringify({
      name: auction.name,
      description: auction.description,
      image: auction.ipfsPath,
    });
    const jsonFile = new File([jsonData], auction.nftId.toString(), { type: 'application/json' });
    nftFiles.push(jsonFile);
  }
  // Add drawing NFTs to content
  for (let drawing of data.drawingGames) {
    for (let nft of drawing.nfts) {
      const jsonData = JSON.stringify({
        name: nft.name,
        description: nft.description,
        image: nft.ipfsPath,
      });
      const jsonFile = new File([jsonData], nft.nftId.toString(), { type: 'application/json' });
      nftFiles.push(jsonFile);
    }
  }
  data.dropMetadataCid = await nftStorageClient.storeDirectory(nftFiles);
  console.log(`createNftsJsonsAndUploadToIpfs() :: CID = ${data.dropMetadataCid}`);
}

async function dbUpdateMetadataCid(data: any) {
  assert(data.dropId);
  assert(data.dropMetadataCid);
  console.log(`dbUpdateMetadataCid(cid: ${data.dropMetadataCid})`);
  await postJSON(
    `${endpoint}?action=UpdateMetadataCid`,
    JSON.stringify({
      dropId: data.dropId,
      dropMetadataCid: data.dropMetadataCid,
    })
  );
}

async function postJSON(url: string, json: string): Promise<Response> {
  return await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
  });
}
