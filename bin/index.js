#!/usr/bin/env node
const fs = require('fs/promises')
const path = require('path')
const dotenv = require('dotenv')
const { Command } = require('commander')
const pkg = require('../package.json')
const appRoot = require('app-root-path')
const dayjs = require('dayjs')
const axios = require('axios')

let wakadata = {}
let itemsAtStart = 0
let maxDays = 13

dotenv.config(path.resolve(appRoot.path, '.env'))
const program = new Command()

program
  .option(
    '-o, --output-file <filepath>',
    'specify where to output the data',
    './wakatime-data.json'
  )
  .option(
    '-m, --max-days <number>',
    'specify maximum number of days to query',
    14
  )
  .option('--fail-when-zero', 'return exit status 1 if no new days are found')
  .version(pkg.version)
  .parse(process.argv)

async function queryData(dateObj = null) {
  if (dateObj === null) {
    dateObj = dayjs().subtract(1, 'day')
  }
  const date = dateObj.format('YYYY-MM-DD')
  return await axios.get(
    `https://wakatime.com/api/v1/users/${process.env.WAKATIME_USER}/summaries?start=${date}&end=${date}&api_key=${process.env.WAKATIME_API_KEY}`
  )
}

async function fetchData() {
  let iterations = 0
  let dateObj = dayjs().subtract(1, 'day')

  console.log(`Fetching Wakatime data for user ${process.env.WAKATIME_USER}`)

  try {
    const contents = await fs.readFile(program.outputFile, { encoding: 'utf8' })
    data = JSON.parse(contents)
    itemsAtStart = Object.keys(data).length
    maxDays = 1
    wakadata = data
    console.log(`✓ Found existing file with ${itemsAtStart} days.`)
  } catch (err) {
    console.log('No existing file found, fetching all previous days.')
  }

  process.stdout.write('Querying: ')

  while (iterations <= maxDays) {
    let results = []
    process.stdout.write('.')

    try {
      result = await queryData(dateObj)
    } catch (err) {
      console.error(err)
      break
    }

    if (result.data.data && Object.keys(result.data.data[0]).length > 0) {
      wakadata[dateObj.format('YYYY-MM-DD')] = result.data.data[0]
    } else {
      break
    }
    dateObj = dateObj.subtract(1, 'day')
    iterations++
  }

  console.log('')
  process.stdout.write('Done. ')
  if (itemsAtStart > 0) {
    const diff = Object.keys(wakadata).length - itemsAtStart
    let plural = 's'
    if (diff === 1) {
      plural = ''
    }
    if (diff > 0) {
      process.stdout.write(`${diff} new day${plural} added.\n`)
    } else {
      process.stdout.write(`No new days found.\n`)
      if (program.failWhenZero) {
        process.exit(1)
      }
    }
  } else {
    process.stdout.write(`Found ${Object.keys(wakadata).length} days.\n`)
  }
  await fs.writeFile(program.outputFile, JSON.stringify(wakadata, null, 2))
}

;(async () => {
  if (!process.env.WAKATIME_USER) {
    console.error('Error: WAKATIME_USER environment variable not set.')
    process.exit(1)
  }
  if (!process.env.WAKATIME_API_KEY) {
    console.error('Error: WAKATIME_API_KEY environment variable not set.')
    process.exit(1)
  }
  maxDays = program.maxDays - 1

  // fetchData()
})()
