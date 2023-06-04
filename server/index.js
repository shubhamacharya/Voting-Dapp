const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

var bodyParser = require('body-parser');
const app = express();
const path = require('path');
const routes = require('./routes/voting.js');

app.use(cors({
    origin: ['http://localhost:5173']
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/voting', routes);

async function start() {
    await mongoose.connect('mongodb://127.0.0.1:27017/voting').then(() => console.log('Connected!'));
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server started listening on port http://localhost:${process.env.PORT}`);
    })
}

start().catch(e => {
    console.log(e.message);
})