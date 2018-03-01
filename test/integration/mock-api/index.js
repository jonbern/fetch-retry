const express = require('express');
const app = express();
let server;

let calls = 0;

app.get('/mock/:status', (req, res) => {
  calls++;
  res.status(req.params.status).send();
});

app.get('/mock', (req, res) => {
  res.status(200).send(calls.toString());
});

app.delete('/mock', (req, res) => {
  calls = 0;
  res.send(calls.toString());
});

app.post('/mock/stop', (req, res) => {
  res.status(200).send();
  server.close();
});


server = app.listen(3000);