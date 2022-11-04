import { PrismaClient } from '@prisma/client'
import { ethers } from 'ethers'

export type CrawlerInfo = {
  id: number
  name: string
  firstIndexedBlock: number
  apiKey: string
}

type LastIndexedBlock = { blockNumber: number; blockTimestamp: number }

const prisma = new PrismaClient()

export async function getLastIndexedBlock(crawler: CrawlerInfo): Promise<LastIndexedBlock> {
  const record = await prisma.crawler.upsert({
    where: { id: crawler.id },
    update: {},
    create: { id: crawler.id, name: crawler.name, lastBlockNumber: crawler.firstIndexedBlock }
  })
  const blockNumber = record.lastBlockNumber
  const provider = new ethers.providers.JsonRpcProvider()
  const blockTimestamp = (await provider.getBlock(blockNumber)).timestamp
  return { blockNumber, blockTimestamp }
}
