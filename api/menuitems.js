const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = express.Router({mergeParams: true});

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    req.params.menuItemId = menuItemId;
    next();
});

//Middleware to check if an employeeId exists
const menuItemChecker = (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (error, row) => {
        if (error) {next(error)}
        if (row) {next()}
        else {res.status(404).send('No menu item exists with that ID')}
    })
}

//Middleware to check if a menu exists
const menuChecker = (req, res, next) => {
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (error, row) => {
        if (error) {next(error)}
        if (row) {next()}
        else {res.status(404).send('No Menu exists with that ID')}
    })
};


menuItemsRouter.get('/', menuChecker, (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (error, rows) => {
        if (error) {next(error)}
        res.status(200).send({menuItems: rows})
    })
})
menuItemsRouter.post('/', menuChecker, (req, res, next) => {
    if (!(req.body.menuItem.name && req.body.menuItem.description && req.body.menuItem.inventory && req.body.menuItem.price)) {
        res.status(400).send()
    } else {
        db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES("${req.body.menuItem.name}","${req.body.menuItem.description}",${req.body.menuItem.inventory}, ${req.body.menuItem.price}, ${req.params.menuId});`, function (error) {
            if (error) {next(error)}

            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID};`, (error, row) => {
                if (error) {next(error)}
                res.status(201).send({menuItem: row})
            })
        });
    }
});

menuItemsRouter.put('/:menuItemId', menuChecker, menuItemChecker, (req, res, next) => {
    if (req.body.menuItem.name && req.body.menuItem.description && req.body.menuItem.inventory && req.body.menuItem.price) {
    db.get(`UPDATE MenuItem SET name = "${req.body.menuItem.name}", description= "${req.body.menuItem.description}", inventory=${req.body.menuItem.inventory}, price=${req.body.menuItem.price} WHERE id = ${req.params.menuItemId}`, (error, row) => {
        if (error) {next(error)}
        res.status(200).send({menuItem: row})
    })
    } else {res.status(400).send('You are missing some menuItem fields!')}
})

menuItemsRouter.delete('/:menuItemId', menuChecker, menuItemChecker, (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId};`, (error) => {
        if (error) {next(error)}
        res.status(200).send('Menu Item deleted')
    })
});


module.exports = menuItemsRouter;