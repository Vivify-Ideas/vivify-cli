function prepareBoardData(boardData) {
  boardData.columns = prepareBoardColumns(boardData)
  delete boardData.backlog_items
  delete boardData.sprints
  return boardData
}

function prepareBoardColumns(boardData) {
  let columns = []
  if (boardData.type === 'scrum') {
    columns.push({
      name: 'Backlog',
      status: '',
      items: boardData.backlog_items
    })

    boardData.sprints.forEach(sprint => {
      columns.push({
        name: sprint.name,
        status: sprint.status,
        items: sprint.columns
          .map(column => column.items)
          .reduce((accumulator = [], currentValue) => {
            return [...accumulator, ...currentValue]
          })
      })
    })
  }

  if (boardData.type === 'kanban') {
    columns = boardData.lists.sort((col1, col2) => col1.order >= col2.order)
  }

  return columns
}

module.exports = {
  prepareBoardData,
  prepareBoardColumns
}
