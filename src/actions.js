const package = require('./../package.json');
const inquirer = require('inquirer');
const axios = require('axios');
const configstore = require('configstore');
const ora = require('ora');

const config = new configstore(package.name, { boards: {} });
const axiosInstance = axios.create({
  baseURL: 'https://www.vivifyscrum.com/api/v1'
});
const spinner = new ora({
  text: '',
  spinner: process.argv[2]
});

const prepareAxiosData = (name, data) => {
  const boardAuthData = config.get(`boards.${name}`);
  if (!boardAuthData) {
    throw new Error(`Persisted Board *${name}* auth data not found!`);
  }
  return {
    data: Object.assign({
      email: boardAuthData.email,
      board: boardAuthData.code
    }, data),
    headers: {
      Authorization: `Bearer ${boardAuthData.token}`
    }
  };
};

const actions = {
  storeBoardAuthData(name, code, email, token) {
    config.set(`boards.${name}`, { email, token, code });
    spinner.succeed(`Successfully persisted Board *${name}* auth data!`);
  },
  removeBoardAuthData(name) {
    inquirer.prompt({
      type: 'confirm',
      name: 'remove_board',
      message: 'Are you sure you want to remove persisted Board auth data?'
    }).then((answer) => {
      let boardExists = !!config.get(`boards.${name}`);
      if (!boardExists) {
        spinner.fail(`Persisted Board auth data *${name}* not found!`);
        return;
      }
      if (answer.remove_board) {
        let boards = config.get('boards');
        delete boards[name];
        config.set('boards', boards);
        spinner.succeed(`Successfully removed Board *${name}* auth data!`);
      }
    });
  },
  listBoardsAuthData() {
    let boards = config.get('boards');
    if (!Object.keys(boards).length) {
      spinner.fail('Persisted Boards auth data not found!');
      return;
    }
    let boardsString = '';
    Object.keys(boards).forEach((key, index) => {
      boardsString += `${index+1}) ${key} \n`;
    });
    console.log(boardsString);
  },
  createItem(name, data) {
    const axiosData = prepareAxiosData(name, data);
    spinner.start('Creating Board Item...');
    axiosInstance.post('/task', axiosData.data, {
      headers: axiosData.headers
    }).then(({ data, status }) => {
      spinner.succeed(`Board Item "${data.name}" (${data.code}) Created`);
    }).catch((e) => {
      spinner.fail('Board Item was not created!');
    })
  },
  removeItem(name, data) {
    const axiosData = prepareAxiosData(name, data);
    spinner.start('Removing Board Item...');
    axiosInstance.delete('/task', {
      params: axiosData.data,
      headers: axiosData.headers
    }).then(({ data, status }) => {
      spinner.succeed('Board Item removed!');
    }).catch((e) => {
      spinner.fail('Board Item removing failed!');
    });
  }
};

module.exports = actions;