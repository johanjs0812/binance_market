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
        const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
        const response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': '4ac9ebe5-2daa-4c05-aef2-b9aea7755bb2'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get('/cryptocurrency/info/:id', async (req, res) => {
    try {
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${req.params.id}`;
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

app.listen(port, function() {
  console.log('Server is running on http://localhost:' + port);
});
