const express = require('express');
const apiRouter = express.Router();
const menuRouter = require('./menu');
const employeesRouter = require('./employees');

apiRouter.use('/menus', menuRouter);
apiRouter.use('/employees/', employeesRouter);

module.exports = apiRouter;