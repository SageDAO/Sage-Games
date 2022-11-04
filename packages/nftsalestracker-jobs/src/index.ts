import alchemyCrawler from './crawler-alchemy'

async function main() {
  await alchemyCrawler()
}

function exit(code: number) {
  process.exit(code)
}

main()
  .then(() => setTimeout(exit, 2000, 0))
  .catch((error) => setTimeout(exit, 2000, 1))
