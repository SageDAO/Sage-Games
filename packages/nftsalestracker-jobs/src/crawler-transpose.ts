/**
 * Crawler for NFT sales data obtained from a Transpose.io endpoint, which supports:
 *
 *  - OpenSea Wyvern
 *  - OpenSea SeaPort
 *  - 0x
 *  - SuperRare
 *  - LooksRare
 *  - Rarible
 *  - Foundation
 *  - CryptoPunks
 *
 * (API started indexing from block 3919706, dated 06/23/2017)
 *
 * https://docs.transpose.io/reference/get_sales
 */

import { ethers } from 'ethers'
import { PrismaClient } from './generated/client'
import axios, { AxiosRequestConfig } from 'axios'
import { CrawlerInfo, getBlockTimestamp, getContractOwner, getLastIndexedBlock } from './utils'

const TRANSPOSE_CRAWLER = <CrawlerInfo>{
  id: 1,
  name: 'transpose',
  firstIndexedBlock: 3919706,
  apiKey: 'WKYpwqJsYloTBer3hkxIiXBZXXt0hhrJ', // TODO move key to env var
}

const prisma = new PrismaClient()

export default async function run() {
  const { blockTimestamp } = await getLastIndexedBlock(TRANSPOSE_CRAWLER)
  const requestHeaders = <AxiosRequestConfig>{
    headers: {
      Accept: 'application/json',
      'x-api-key': TRANSPOSE_CRAWLER.apiKey,
    },
  }
  var url = `https://api.transpose.io/nft/sales?chain_id=ethereum&order=asc&limit=100&sold_after=${blockTimestamp}`
  var importedRecordCount = 0

  while (url) {
    var { data } = await axios.get(url, requestHeaders)
    importedRecordCount += data.results.length
    var lastBlockNumber = await consumeData(data.results)
    //await prisma.crawler.update({ where: { id: TRANSPOSE_CRAWLER.id }, data: { lastBlockNumber }})
    console.log(`${url} :: ${data.results.length} records (${importedRecordCount} total, block = ${lastBlockNumber})`)
    url = null // data.next
  }
}

async function consumeData(rows: any[]): Promise<number> {
  const prismaCreates = []
  for (const row of rows) {
    prismaCreates.push({
      crawlerId: TRANSPOSE_CRAWLER.id,
      txHash: row.transaction_hash,
      blockNumber: row.block_number,
      blockTimestamp: await getBlockTimestamp(row.block_number),
      marketplace: `${row.exchange_name}-${row.contract_version}`,
      contractAddress: row.contract_address,
      ownerAddress: await getContractOwner(row.contract_address),
      tokenId: row.token_id,
      sellerAddress: row.seller,
      buyerAddress: row.buyer,
      price: parseFloat(ethers.utils.formatEther(String(row.price))),
      paymentToken: row.payment_token,
    })
    // TODO connect relationships
  }
  //await prisma.nftSale.createMany({ data: prismaCreates, skipDuplicates: true })
  return prismaCreates.pop().blockNumber
}

//const provider = new ethers.providers.CloudflareProvider()
//const address = await provider.resolveName('mydomain.eth')
