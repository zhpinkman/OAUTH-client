const config = require('./config.json')
const client_id = config.client_id
const client_secret = config.client_secret
const express = require('express');
const axios = require('axios');
const app = express();
const port = 8589; // change this in case you wanted to run the server on a different port
var github_code = '';
var access_token = '';

app.use(express.static('/Users/zhivarsourati/Documents/Network Security/CA3/login-formmodal/src'));
// directory for the static files like HTML and css files

function get_parameters(res) {
  var dict = new Object();
  splitted_res = res.split('&')
  console.log(splitted_res)
  splitted_res.forEach(field => {
    field_values = field.split('=')
    dict[field_values[0]] = field_values[1]
  });
  return dict
}

async function get_user(access_token) {
  console.log('getting the user information ...')
  return axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `token ${access_token}`
    }
  })
    .then(res => {
      return res.data;
    })
    .catch(error => {
      console.log(error)
    })
}

async function get_access_token(client_secret, client_id, github_code) {
  console.log('performing the post request ...')
  return axios
    .post('https://github.com/login/oauth/access_token', {
      client_id: client_id,
      client_secret: client_secret,
      code: github_code
    })
    .then(res => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res.data)
      params = get_parameters(res.data)
      return params['access_token']
    })
    .catch(error => {
      console.error(error)
    })
}

app.get('/oauth/redirect', async (req, res) => {
  github_code = req.query.code;
  console.log(`Github code is: ${github_code}`);
  console.log('getting access token from the github server ...');
  access_token = await get_access_token(client_secret, client_id, github_code)
  user_info = await get_user(access_token)
  res.send(user_info)
});

app.get('/', (req, res) => {
  res.sendFile('index.html');
})

app.listen(port, () => {
  console.log(`server is listening on port: ${port}`)
});