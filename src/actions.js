const package = require('./../package.json')
const inquirer = require('inquirer')
const configstore = require('configstore')
const ora = require('ora')
const config = new configstore(package.name, { boards: {} })
const spinner = new ora({
  text: '',
  spinner: process.argv[2]
})

const {
  getBoardApiRequest,
  createItemApiRequest,
  updateItemApiRequest,
  removeItemApiRequest
} = require('./api')
const {
  prepareBoardData
} = require('./mapper')
const {
  colorByItemType,
  drawBoardTable,
  drawBoardItem
} = require('./outputs')


function storeBoardAuthData(name, code, email, token) {
  config.set(`boards.${name}`, { email, token, code })
  spinner.succeed(`Successfully persisted Board *${name}* auth data!`)
}

async function removeBoardAuthData(name) {
  const { answer } = await inquirer.prompt({
    type: 'confirm',
    name: 'remove_board',
    message: 'Are you sure you want to remove persisted Board auth data?'
  })
  let boardExists = !!config.get(`boards.${name}`)
  if (!boardExists) {
    spinner.fail(`Persisted Board auth data *${name}* not found!`)
    return
  }
  if (answer.remove_board) {
    let boards = config.get('boards')
    delete boards[name]
    config.set('boards', boards)
    spinner.succeed(`Successfully removed Board *${name}* auth data!`)
  }
}

function listBoardsAuthData() {
  let boards = config.get('boards')
  if (!Object.keys(boards).length) {
    spinner.fail('Persisted Boards auth data not found!')
    return
  }
  let boardsString = ''
  Object.keys(boards).forEach((key, index) => {
    boardsString += `${index+1}) ${key} \n`
  })
  console.log(boardsString)
}

async function showBoard(name, numberOfColumns) {
  try {
    spinner.start('Loading Board...')
    const boardAuthData = config.get(`boards.${name}`)
    const { data } = await getBoardApiRequest(boardAuthData)
    const board = prepareBoardData(data)
    config.set(`boards.${name}.data`, board)
    spinner.succeed(
      `Board "${data.name}" (${data.code}) Loaded`
    )
    drawBoardTable(board, numberOfColumns)
  } catch (error) {
    spinner.fail(error.response.data.error)
  }
}

async function createItem(name, requestData) {
  try {
    spinner.start('Creating Board Item...')
    const boardAuthData = config.get(`boards.${name}`)
    const { data } = await createItemApiRequest(boardAuthData, requestData)
    spinner.succeed(
      `Board Item "${data.name}" (${data.code}) Created`
    )
  } catch (error) {
    spinner.fail(error.response.data.error)
  }
}

async function updateItem(name, requestData) {
  try {
    spinner.start('Updating Board Item...')
    const boardAuthData = config.get(`boards.${name}`)
    const { data } = await updateItemApiRequest(boardAuthData, requestData)
    spinner.succeed(
      `Board Item "${data.name}" (${data.code}) Updated`
    )
  } catch (error) {
    spinner.fail(error.response.data.error)
  }
}

async function removeItem(name, requestData) {
  try {
    spinner.start('Removing Board Item...')
    const boardAuthData = config.get(`boards.${name}`)
    const { data } = await removeItemApiRequest(boardAuthData, requestData)
    spinner.succeed('Board Item removed!')
  } catch (error) {
    spinner.fail(error.response.data.error)
  }
}

function showItem(name, hashcode) {
  let loadedBoardData = config.get(`boards.${name}.data`)
  if (!loadedBoardData) {
    spinner.fail('Board not found!')
    return
  }
  let items = loadedBoardData.columns
    .map((column) => column.items)
    .reduce(
      (accumulator = [], items) => [ ...accumulator, ...items ]
    )
  let item = items.find(
    (item) => item.code === hashcode)
  if (!item) {
    spinner.fail('Board Item not found!')
    return
  }
  drawBoardItem(item)
}

module.exports = {
  listBoardsAuthData,
  storeBoardAuthData,
  removeBoardAuthData,
  showBoard,
  createItem,
  updateItem,
  showItem,
  removeItem
}
