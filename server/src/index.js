const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:4200' }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get('/cryptocurrency/listings/latest', async (req, res) => {
    try {
        const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=5000&convert=USD';
        const response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': '4ac9ebe5-2daa-4c05-aef2-b9aea7755bb2', 
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get('/cryptocurrency/info/:symbol', async (req, res) => {
  try {
      const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${req.params.symbol}`;
      const response = await axios.get(url, {
          headers: {
              'Accepts': 'application/json',
              'X-CMC_PRO_API_KEY': '4ac9ebe5-2daa-4c05-aef2-b9aea7755bb2'
          }
      });
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: error.toString() });
  }
});

const baseUrl = 'https://api.coingecko.com/api/v3';

app.get('/coins/:id', async (req, res) => {
    console.log('xxxx')

    try {
        const response = await axios.get(`${baseUrl}/coins/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get('/coins', async (req, res) => {
    console.log('cnnss')
    try {
        const ids = req.query.ids.split(',');
        const requests = ids.map(id => axios.get(`${baseUrl}/coins/${id}`));
        const responses = await Promise.all(requests);
        res.json(responses.map(response => response.data));
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, function() {
  console.log('Server is running on http://localhost:' + port);
});
