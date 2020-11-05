const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./api/routes/user');
const pinRoutes = require('./api/routes/pin');
const categoryRoutes = require('./api/routes/category');


mongoose.connect('mongodb+srv://gperdigal:Epsi2020@GM@cluster0.3jj3c.mongodb.net/greenmapping?retryWrites=true&w=majority', {
    useNewUrlParser: true
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, GET, PUT');
        return res.status(200).json({});
    }
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));

app.use(cors());
app.use('/user', userRoutes);
app.use('/pin', pinRoutes);
app.use('/category', categoryRoutes);

module.exports = app;
