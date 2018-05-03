const table = require('cli-table')
const chalk = require('chalk')
const wrap = require('wrap-ansi')

/* Change output text color */
function colorByItemType(itemType, data) {
  let color = '#fff'
  switch(itemType) {
    case 'Bug':
      color = '#ff4040'
      break
    case 'Story':
      color = '#66cdaa'
      break
    case 'Improvement':
      color = '#35bcf8'
      break
    case 'Task':
      color = '#ffc371'
      break
    case 'Note':
      color = '#ffff00'
      break
    case 'Idea':
      color = '#ff66ff'
      break
    default:
      color = '#fff'
  }
  if (data instanceof Array) {
    return data.map((item) => {
      if (item instanceof Array) {
        return item.map(
          (stringElement) =>
            chalk.hex(color)(stringElement)
        )
      }
      return chalk.hex(color)(item)
    })
  }
  return chalk.hex(color)(data || itemType)
}

/* Draw Board Table with Items */
function drawBoardTable (boardData, numberOfColumns) {
  let columns = boardData.columns.slice(
    (boardData.columns.length < numberOfColumns ?
      0 : (boardData.columns.length - numberOfColumns)),
    boardData.columns.length
  )
  let tableInstance = new table({
    head: columns.map((column) =>
      chalk.hex(
        column.status === 'active' ? '#5cc1a6' : '#ff4040'
      )(`${column.name} (${column.items.length})`)),
    colWidths: columns.map((column) => 20)
  })
  let columnItems = columns.map(
    col => col.items.map(
      (item) => colorByItemType(
        item.type, wrap(`${item.code} ${item.name}`.trim(), 10)
      ))
    )
  let items = []
  let maxItems = columnItems
    .map((items) => items.length)
    .reduce((val1, val2) => Math.max(val1, val2))

  for (let i = 0; i < maxItems; i++) {
    let row = []
    columnItems
      .forEach((column, columnIndex) => {
        let item = columnItems[columnIndex][i] || ''
        row.push(item)
      })
    items.push(row)
  }

  tableInstance.push(...items)
  console.log(tableInstance.toString())
}

/* Draw Board Item */
function drawBoardItem(item) {
  let tableInstance = new table({
    head: [ colorByItemType(item.type, item.name) ],
    colWidths: [ 50 ]
  })

  let coloredItemData = colorByItemType(
    item.type,
    [
      [ `Code: ${item.code}` ],
      [ wrap(`Description: ${item.description || 'None'}`, 50) ],
      [ `Type: ${item.type}` ],
      [ `Author: ${item.creator ? item.creator.name : ''}` ],
      [ `Created at (utc): ${item.created_at}` ],
      [ `Updated at (utc): ${item.updated_at}` ],
    ]
  )
  tableInstance.push(
    ...coloredItemData
  )
  console.log(tableInstance.toString())
}

module.exports = {
  colorByItemType,
  drawBoardTable,
  drawBoardItem
}
