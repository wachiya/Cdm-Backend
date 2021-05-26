const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * @api {get} /api/v1/search/
 *
 * @description search patient(s) by name. Returns status 404 if query returns no match
 *
 * @apiParam (URI Param) {String} name - the name of the patient to search
 *
 * @apiSuccess {Object[]} patients object
 */

router.get('/', function (req, res) {
    const searchTerm = req.query.name;
    //if there is no search term
    if (!searchTerm) {
        res.status(400); //let us blame the user
        return res.send({error: 'We did not receive any search parameter'});
    }

    const sqlQuery = `SELECT patient.*, flat_cdm_summary.htn_status,flat_cdm_summary.dm_status FROM patient ` +
        `LEFT JOIN flat_cdm_summary ` +
        `ON patient.patient_id = flat_cdm_summary.patient_id ` +
        `WHERE patient.name = ?`;

    db.query(sqlQuery, [searchTerm], (error, results) => {
        if (error) {
            res.status(500);
            //we have to return to hijack/end the execution
            return res.send({
                error: 'Server error' // this is simple message for demo purpose.
            });
        }

        //return 404 if there are no results also
        if (results.length === 0) {
            res.status(404);
            return res.send({
                error: 'Patient with that name not found'
            })
        }

        res.send({
            patients: results
        })
    });
})


module.exports = router;