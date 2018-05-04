const table = require('cli-table')
const chalk = require('chalk')
const wrap = require('wrap-ansi')

const ITEM_TYPE_COLORS = {
  Bug: '#ff4040',
  Story: '#66cdaa',
  Improvement: '#35bcf8',
  Task: '#ffc371',
  Note: '#ffff00',
  Idea: '#ff66ff'
}

/* Change output text color */
function colorByItemType(itemType, data) {
  let color = ITEM_TYPE_COLORS[itemType] || '#fff';
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
        column.status === 'active' ?
          ITEM_TYPE_COLORS.Story : ITEM_TYPE_COLORS.Bug
      )(wrap(`${column.name} (${column.items.length})`, 18))),
    colWidths: columns.map((column) => 20)
  })
  let columnItems = columns.map(
    col => col.items.map(
      (item) => colorByItemType(
        item.type,
        wrap(`${item.code} ${item.name}`.trim(), 10)
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
