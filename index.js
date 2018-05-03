#!/usr/bin/env node

const yargs = require('yargs')
const package = require('./package.json')
const actions = require('./src/actions')

const epilogText = `
Made with ❤️  by VivifyScrum
https://www.vivifyscrum.com/
`

yargs
  .usage('$0 <command> [options]', 'VivifyScrum CLI tool')
  .command('store [code] [email] [token]', 'Persist Board Auth data (token)',
    (yargs) => {
      yargs
        .positional('name', {
          alias: 'n',
          describe: 'Board auth data name',
          default: 'default',
          type: 'string'
        })
        .positional('code', {
          alias: 'c',
          describe: 'Board Code',
          type: 'string'
        })
        .positional('email', {
          alias: 'e',
          describe: 'User email (any Board member)',
          type: 'string'
        })
        .positional('token', {
          alias: 't',
          describe: 'Board auth token (you must be authorized for API actions)',
          type: 'string'
        })
        .demandOption([ 'c', 't', 'e' ])
    }, (args) => {
      actions.storeBoardAuthData(
        args.name, args.code, args.email, args.token
      )
    })
  .command('remove [name]', 'Remove persisted Board auth data',
    (yargs) => {
      yargs
        .positional('name', {
          alias: 'n',
          describe: 'Board auth data name',
          default: 'default',
          type: 'string'
        })
        .demandOption([ 'n' ])
    }, (args) => {
      actions.removeBoardAuthData(args.name)
    })
  .command('list', 'List persisted Board auth data names',
    (yargs) => {
    }, (args) => {
      actions.listBoardsAuthData()
    })
  .command('show:board [board]', 'Show Board',
    (yargs) => {
      yargs
        .positional('board', {
          alias: 'b',
          describe: 'Persisted Board auth data name',
          default: 'default',
          type: 'string'
        })
        .positional('size', {
          alias: 's',
          describe: 'Number of Columns to display. Default number is 4',
          default: 4,
          type: 'number'
        })
    }, async (args) => {
      await actions.showBoard(args.board, args.size)
    })
  .command('show:item [board] [hascode]', 'Show Board Item',
    (yargs) => {
      yargs
        .positional('board', {
          alias: 'b',
          describe: 'Persisted Board auth data name',
          default: 'default',
          type: 'string'
        })
        .positional('hashcode', {
          alias: 'h',
          describe: 'Item hashcode',
          type: 'string'
        })
        .demandOption([ 'h' ])
    }, (args) => {
      actions.showItem(args.board, args.hashcode)
    })
  .command('create:item [board] [name]', 'Create Board Item',
    (yargs) => {
      yargs
        .positional('board', {
          alias: 'b',
          describe: 'Persisted Board auth data name',
          default: 'default',
          type: 'string'
        })
        .positional('name', {
          alias: 'n',
          describe: 'Item name',
          type: 'string'
        })
        .positional('description', {
          alias: 'd',
          describe: 'Item description',
          type: 'string',
          default: ''
        })
        .positional('type', {
          alias: 't',
          describe: 'Item type',
          type: 'string',
          default: 'Story',
          choices: [ 'Story', 'Improvement', 'Bug', 'Task', 'Note' ]
        })
        .demandOption([ 'n' ])
    }, (args) => {
      actions.createItem(args.board, {
        name: args.name,
        description: args.description,
        type: args.type
      })
    })
  .command('remove:item [board] [hashcode] [remove_subitems]', 'Remove Board Item',
    (yargs) => {
      yargs
        .positional('board', {
          alias: 'b',
          describe: 'Persisted Board auth data name',
          default: 'default',
          type: 'string'
        })
        .positional('hashcode', {
          alias: 'h',
          describe: 'Item hashcode',
          type: 'string'
        })
        .positional('remove_subitems', {
          alias: 'r',
          describe: 'Remove Subitems flag',
          type: 'boolean',
          default: false
        })
        .demandOption([ 'h' ])
    }, (args) => {
      actions.removeItem(args.board, {
        task: args.hashcode,
        delete_subtasks: args.remove_subitems
      })
    })
  .command('help', 'Show Help')
  .version(package.version)
  .epilog(epilogText)
  .argv
