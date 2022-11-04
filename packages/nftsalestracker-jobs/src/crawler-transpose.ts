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

import { PrismaClient } from '@prisma/client'
import { CrawlerInfo, getLastIndexedBlock } from './utils'

const TRANSPOSE_CRAWLER = <CrawlerInfo>{
  id: 1,
  name: 'transpose',
  firstIndexedBlock: 3919706,
  apiKey: 'WKYpwqJsYloTBer3hkxIiXBZXXt0hhrJ'
}

const prisma = new PrismaClient()

export default async function run() {

  const { blockTimestamp } = await getLastIndexedBlock(TRANSPOSE_CRAWLER)

  var url = `https://api.transpose.io/nft/sales?chain_id=ethereum&order=asc&limit=100&sold_after=${blockTimestamp}`

  while (url) {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': TRANSPOSE_CRAWLER.apiKey
      }
    })
    const data = await response.json()
    url = data.next
    var lastBlockNumber = await consumeData(data.results)
  }
}

async function consumeData(rows: any[]): Promise<number> {
    const prismaCreates = []
    for (const row of rows) {
        prismaCreates.push(
        prisma.nftSale.create({
            crawlerId       Int
            crawler         Crawler       @relation(fields: [crawlerId], references: [id])
            txHash          String
            blockNumber     Int
            blockTimestamp  Int
            marketplace     String
            contractAddress String
            ownerAddress    String
            tokenId         Int
            sellerAddress   String
            buyerAddress    String
            price           Float
            paymentToken    String
          
            $noData: true
        })
        )
    }
    await prisma.batch(prismaCreates)
    return prismaCreates.pop().blockNumber
}

//export {}
//const provider = new ethers.providers.CloudflareProvider()
//const address = await provider.resolveName('mydomain.eth')
