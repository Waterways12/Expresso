const express = require('express');
const app = express();
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./api/api');
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(errorhandler());
app.use(cors());

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`The Server is listening on PORT: ${PORT}`)
})

module.exports = app;