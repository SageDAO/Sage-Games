import { PrismaClient } from '@prisma/client'
import { ethers } from 'ethers'
import { Cache } from 'memory-cache'

export type CrawlerInfo = {
  id: number
  name: string
  firstIndexedBlock: number
  apiKey: string
}

type LastIndexedBlock = { blockNumber: number; blockTimestamp: number }

const prisma = new PrismaClient()
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth') // TODO use pro (alchemy?) rpc url
const blockTimestampCache = new Cache<number, number>()
const contractOwnerCache = new Cache<string, string>()

export async function getLastIndexedBlock(crawler: CrawlerInfo): Promise<LastIndexedBlock> {
  const record = await prisma.crawler.upsert({
    where: { id: crawler.id },
    update: {},
    create: { id: crawler.id, name: crawler.name, lastBlockNumber: crawler.firstIndexedBlock },
  })
  const blockNumber = record.lastBlockNumber
  const blockTimestamp = await getBlockTimestamp(blockNumber)
  console.log(`getLastIndexedBlock() :: { ${blockNumber}, ${new Date(blockTimestamp * 1_000).toISOString()} }`)
  return { blockNumber, blockTimestamp }
}

export async function getBlockTimestamp(blockNumber: number): Promise<number> {
  var blockTimestamp = blockTimestampCache.get(blockNumber)
  if (!blockTimestamp) {
    try {
      blockTimestamp = (await provider.getBlock(blockNumber)).timestamp
      blockTimestampCache.put(blockNumber, blockTimestamp, 15_000) // cache results for 15 seconds
    } catch (e) {
      console.log(e)
    }
  }
  return blockTimestamp
}

export async function getContractOwner(contractAddress: string): Promise<string> {
  var ownerAddress = contractOwnerCache.get(contractAddress)
  if (!ownerAddress) {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        ['function owner() public view returns (address)'],
        provider
      )  
      ownerAddress = await contract.owner()
    } catch (e) {
      ownerAddress = 'null'
    }
    contractOwnerCache.put(contractAddress, ownerAddress, 90_000) // cache results for 90 seconds
  }
  return ownerAddress == 'null' ? null : ownerAddress
}
