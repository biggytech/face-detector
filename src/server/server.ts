import '@tensorflow/tfjs-node';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT;

app.use(express.static(path.resolve(__dirname, 'public')));

app.listen(port, () => {
  console.log(`The app listening on port ${port}`);
});