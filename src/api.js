const axios = require('axios')
const axiosInstance = axios.create({
  baseURL: 'https://www.vivifyscrum.com/api/v1'
})

function prepareAxiosData (boardAuthData, data = {}) {
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

async function getBoardApiRequest(boardAuthData) {
  let axiosData = prepareAxiosData(boardAuthData);
  return axiosInstance.get('/board-export', {
    params: axiosData.data,
    headers: axiosData.headers
  })
}

async function createItemApiRequest(boardAuthData, data) {
  let axiosData = prepareAxiosData(boardAuthData, data)
  return axiosInstance.post('/task', axiosData.data, {
    headers: axiosData.headers
  })
}

async function removeItemApiRequest(boardAuthData, data) {
  let axiosData = prepareAxiosData(boardAuthData, data)
  return axiosInstance.delete('/task', {
    params: axiosData.data,
    headers: axiosData.headers
  })
}

module.exports = {
  getBoardApiRequest,
  createItemApiRequest,
  removeItemApiRequest
}
