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
import axios, { AxiosRequestConfig } from 'axios'
import { PrismaClient } from './generated/client'
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
    await prisma.crawler.update({ where: { id: TRANSPOSE_CRAWLER.id }, data: { lastBlockNumber }})
    console.log(`${new Date().toISOString()} ${url} :: ${data.results.length} records (${importedRecordCount} total, block = ${lastBlockNumber})`)
    url = data.next
  }
}

async function consumeData(rows: any[]): Promise<number> {
  const prismaCreates = []
  var contractQueryTimeSum = 0;
  var dbQueryTimeSum = 0
  for (const row of rows) {
    var contractQueryIn = performance.now()
    const ownerAddress = await getContractOwner(row.contract_address)
    const blockTimestamp = await getBlockTimestamp(row.block_number)
    var contractQueryOut = performance.now()
    contractQueryTimeSum += contractQueryOut - contractQueryIn
    const data = {
      crawler: { connect: { id: TRANSPOSE_CRAWLER.id }},
      txHash: row.transaction_hash,
      blockNumber: row.block_number,
      blockTimestamp,
      marketplace: `${row.exchange_name}-${row.contract_version}`,
      contractAddress: row.contract_address,
      tokenId: row.token_id,
      sellerAddress: row.seller,
      buyerAddress: row.buyer,
      price: parseFloat(ethers.utils.formatEther(String(row.price))),
      paymentToken: row.payment_token,
      ownerWallet: null || {}
    }
    if (ownerAddress) {
      data.ownerWallet = { 
        connectOrCreate: { 
          where: { address: ownerAddress }, 
          create: { address: ownerAddress } 
        } 
      }
    }
    const dbQueryIn = performance.now()
    try {
      await prisma.nftSale.create({ data })
    } catch (e: any) {
      console.log(e.message)
    }
    const dbQueryOut = performance.now()
    dbQueryTimeSum += dbQueryOut - dbQueryIn
    prismaCreates.push(data)
  }
  console.log(`Avg contract query time: ${contractQueryTimeSum/prismaCreates.length}`)
  console.log(`Avg db query time: ${dbQueryTimeSum/prismaCreates.length}`)
  return prismaCreates.pop().blockNumber
}

//const provider = new ethers.providers.CloudflareProvider()
//const address = await provider.resolveName('mydomain.eth')
