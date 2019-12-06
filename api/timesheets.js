const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const timesheetsRouter = express.Router({mergeParams: true});

//Setting up the timesheetId param
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    req.params.timesheetId = timesheetId;
    next();
})


//Middleware to check if an employeeId exists
const employeeIdChecker = (req, res, next) => {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, row) => {
        if (error) {next(error)}
        if (row) {next()}
        else {res.status(404).send('No employee with that id exists.')}
    })
}

//Middleware to check if a timesheetId exists
const timesheetChecker = (req, res, next) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (error, row) => {
        if (error) {next(error)}
        if (row) {next()}
        else {res.status(404).send('No Timesheet exists with that ID')}
    })
};

timesheetsRouter.get('/', employeeIdChecker, (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (error, rows) => {
        if (error) {next(error)}
        res.status(200).send({timesheets: rows})
    })
})
timesheetsRouter.post('/', employeeIdChecker, (req, res, next) => {
    if (!(req.body.timesheet.date && req.body.timesheet.hours && req.body.timesheet.rate)) {
        res.status(400).send()
    } else {
        db.run(`INSERT INTO Timesheet (date, hours, rate, employee_id) VALUES('${req.body.timesheet.date}',${req.body.timesheet.hours},${req.body.timesheet.rate}, ${req.params.employeeId})`, function (error) {
            if (error) {next(error)}

            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID};`, (error, timesheet) => {
                res.status(201).send({timesheet: timesheet})
            })
        });
    }
});

timesheetsRouter.put('/:timesheetId', employeeIdChecker, timesheetChecker, (req, res, next) => {
    if (req.body.timesheet.rate && req.body.timesheet.hours && req.body.timesheet.date) {
    db.get(`UPDATE Timesheet SET rate = ${req.body.timesheet.rate}, hours=${req.body.timesheet.hours}, date=${req.body.timesheet.date} WHERE id = ${req.params.timesheetId}`, (error, row) => {
        if (error) {next(error)}
        res.status(200).send({timesheet: row})
    })
    } else {res.status(400).send('You are missing some timesheet fields!')}
})

timesheetsRouter.delete('/:timesheetId', employeeIdChecker, timesheetChecker, (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId};`, (error) => {
        if (error) {next(error)}
        res.status(200).send('Timesheet deleted')
    })
});

// timesheetsRouter.put('/')
module.exports = timesheetsRouter;