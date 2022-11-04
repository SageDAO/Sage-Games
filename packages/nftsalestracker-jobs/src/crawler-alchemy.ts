/**
 * Crawler for NFT sales data obtained from an Alchemy endpoint, which supports:
 *
 *   - OpenSea (Seaport)
 *   - LooksRare
 *   - x2y2
 *
 * (API only started indexing from block 13899842, dated 12/29/2021)
 *
 * https://docs.alchemy.com/reference/getnftsales
 */

import { Network, Alchemy } from 'alchemy-sdk'
import { PrismaClient } from '@prisma/client'

const CRAWLER_ID = 2
const CRAWLER_NAME = 'alchemy'
const ALCHEMY_KEY = 'U1dr8L1ve25H9E_iJ7d98wnh2Yrr0ry7'

const prisma = new PrismaClient()
const alchemy = new Alchemy({
  apiKey: ALCHEMY_KEY,
  network: Network.ETH_MAINNET
})

export default async function run() {
  const lastIndexedBlockNumber: number = await getLastIndexedBlockNumber()
  const currentBlockNumber: number = await alchemy.core.getBlockNumber()
  console.log(`Last indexed block number: ${lastIndexedBlockNumber}`)
  console.log(`Current block number: ${currentBlockNumber}`)
}

async function getLastIndexedBlockNumber(): Promise<number> {
  const record = await prisma.crawler.upsert({
    where: { id: CRAWLER_ID },
    update: {},
    create: { id: CRAWLER_ID, name: CRAWLER_NAME, lastBlockNumber: 13899842 }
  })
  return record.lastBlockNumber
}

//export {}
//const provider = new ethers.providers.CloudflareProvider()
//const address = await provider.resolveName('mydomain.eth')
