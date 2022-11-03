import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'

const CRAWLER_ID = 1
const CRAWLER_NAME = 'alchemy'

clear()
console.log(chalk.red(figlet.textSync('nftsalestracker', { horizontalLayout: 'full' })))

//export {}
//const provider = new ethers.providers.CloudflareProvider()
//const address = await provider.resolveName('mydomain.eth')