/**
 * Crawler for NFT sales data obtained from an Alchemy endpoint, which supports:
 *
 *   - OpenSea (Seaport) address 0x50075f151abc5b6b448b1272a0a1cfb5cfa25828, deployed on block 14806444 (05/19/2022)
 *   - LooksRare         address 0xaf1cfc6b4104c797149fb7a294f7d46f7ec27b80, deployed on block 13891957 (12/28/2021)
 *   - x2y2              address 0xd0c3cd7ac1109593e31150098ef77abe3ff18f98, deployed on block 14055260 (01/22/2022)
 *
 * https://docs.alchemy.com/reference/getnftsales
 */

import { Network, Alchemy } from 'alchemy-sdk'
import { PrismaClient } from '@prisma/client'

const CRAWLER_ID = 1
const CRAWLER_NAME = 'alchemy'
const ALCHEMY_KEY = 'U1dr8L1ve25H9E_iJ7d98wnh2Yrr0ry7'

const prisma = new PrismaClient()
const alchemy = new Alchemy({
  apiKey: ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
})

export default async function run() {
  const lastIndexedBlockNumber: number = await getLastIndexedBlockNumber()
  const currentBlockNumber: number = await alchemy.core.getBlockNumber()
  console.log(`Last indexed block number: ${lastIndexedBlockNumber}`)
  console.log(`Current block number: ${currentBlockNumber}`)
}

async function getLastIndexedBlockNumber(): Promise<number> {
  const record = await prisma.crawler.findUnique({ where: { id: CRAWLER_ID } })
  return record ? record.lastBlockNumber : 13891957
}

//export {}
//const provider = new ethers.providers.CloudflareProvider()
//const address = await provider.resolveName('mydomain.eth')
