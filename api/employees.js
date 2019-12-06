const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const employeesRouter = express.Router();

//Setting up router for :employeeId/timesheets queries
employeesRouter.use('/:employeeId/timesheets/', timesheetsRouter);

//Middleware to create an employeeId Param
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    req.params.employeeId = employeeId;
    next();
});

//Middleware to check if an employeeId exists
const employeeIdChecker = (req, res, next) => {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, row) => {
        if (error) {next(error)}
        if (row) {next()}
        else {res.status(404).send('No employee with that id exists.')}
    })
}

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, rows) => {
        if (error) {next(error)}
        res.status(200).send({employees: rows})
    })
});

employeesRouter.post('/', (req, res, next) => {
    if (req.body.employee.name && req.body.employee.position && req.body.employee.wage) {
    db.run(`INSERT INTO Employee(name, position, wage, is_current_employee) VALUES('${req.body.employee.name}','${req.body.employee.position}',${req.body.employee.wage},${req.body.employee.isCurrentEmployee})`, function (error) {
        if (error) {console.log('THIS SQL Query is bad'); next(error);}
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID};`, (error, row) => {
            console.log(row)
            if (error) {console.log('NO THIS SQL Query is bad'); next(error)}
            res.status(201).send({employee: row});
        })
        })
    } else {res.status(400).send('Employee fields are missing')}
});


employeesRouter.get('/:employeeId', employeeIdChecker, (req, res, next) => {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId};`, (error, row) => {
        if (error) {next(error)}
        else {res.status(200).send({employee: row})}
    })
})

employeesRouter.put('/:employeeId', employeeIdChecker, (req, res, next) => {
    db.run(`UPDATE Employee SET name = '${req.body.employee.name}', position = '${req.body.employee.position}', wage = ${req.body.employee.wage}, is_current_employee = ${req.body.employee.isCurrentEmployee} WHERE id = ${req.params.employeeId};`, (error) => {
        if (error) {next(error)}
        db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId};`, (error, row) => {
            if (error) {next(error)}
            res.status(200).send({employee: row})
        })
    })
})

employeesRouter.delete('/:employeeId', employeeIdChecker, (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`, (error) => {
        if (error) { next(error) }
        db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, row) => {
            if (error) {next(error)}
            res.status(200).send({employee: row})
        })
    });
})

module.exports = employeesRouter;