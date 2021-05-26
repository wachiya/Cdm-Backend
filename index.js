const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); //load config from .env file

const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 3000;

const app = express();
app.use(cors());

const namespace = '/api/v1'

app.use(`${namespace}/patients`, require('./routes/patients'));
app.use(`${namespace}/search`, require('./routes/search'));
app.use(`${namespace}/reports`, require('./routes/reports'));


app.listen(port, () => {
    console.log(`Backend app running at port ${port}`)
})

