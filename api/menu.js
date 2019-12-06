const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuitems');
const menuRouter = express.Router();

menuRouter.param('/:menuId', (req, res, next, menuId) => {
    req.params.menuId = menuId;
    next();
})

//Middleware to check if a menuId exists
const menuChecker = (req, res, next) => {
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (error, row) => {
        if (error) {next(error)}
        if (row) {next()}
        else {res.status(404).send('No Menu exists with that ID')}
    })
};

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu;', (error, rows) => {
        if (error) {next(error)}
        res.status(200).send({menus: rows})
    })
})


menuRouter.get('/:menuId', menuChecker, (req, res, next) => {
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId};`, (error, row) => {
        if (error) {next(error)}
        res.status(200).send({menu: row})
    })
})
menuRouter.post('/', (req, res, next) => {
    if (req.body.menu.title) {
    db.run(`INSERT INTO Menu(title) VALUES('${req.body.menu.title}')`, function (error) {
        if (error) {console.log('Error inserting Menu into SQL'); next(error);}
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID};`, (error, row) => {
            console.log(row)
            if (error) {console.log('Error pulling newly created menu from SQL'); next(error)}
            res.status(201).send({menu: row});
        })
        })
    } else {res.status(400).send('The menu has no title!')}
});

menuRouter.put('/:menuId', menuChecker, (req, res, next) => {
    db.run(`UPDATE Menu SET title = '${req.body.menu.title}'WHERE id = ${req.params.menuId};`, (error) => {
        if (error) {next(error)}
        db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId};`, (error, row) => {
            if (error) {next(error)}
            res.status(200).send({menu: row})
        })
    })
})

menuRouter.delete('/:menuId', menuChecker, (req, res, next) => {
    db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId};`, (error) => {
        if (error) { next(error) }
        res.status(200).send('Menu deleted')
    });
})

//Using menuItems router for further queries
menuRouter.use('/:menuId/menu-items/', menuItemsRouter);

module.exports = menuRouter;