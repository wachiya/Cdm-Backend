const express = require('express')
const router = express.Router()
const db = require('../utils/db')


/**
 * @api {get} /api/v1/patients/
 *
 * @description get all patients
 *
 * @apiSuccess {Object[]} patient object
 *
 */
router.get('/', function (req, res) {

    const sqlQuery = ' SELECT patient.*, flat_cdm_summary.htn_status,flat_cdm_summary.dm_status, location.name as location  FROM patient ' +
        ' LEFT JOIN flat_cdm_summary ' +
        ' ON patient.patient_id = flat_cdm_summary.patient_id ' +
        ' INNER JOIN location ' +
        ' ON flat_cdm_summary.location_id = location.id ';

    db.query(sqlQuery, (error, results, /*fields*/) => {
        if (error) {
            console.log(error); // the error can be logged on something like sentry

            res.status(500);
            //we have to return to hijack/end the execution
            return res.send({
                error: 'Server error' // this is simple message for demo purpose.
            })
        }

        res.send({
            patients: results
        })
    });

})



/**
 * @api {get} /api/v1/patients/{locationId}/{month}
 *
 * @description get all patients with specific ht_status or dm_status at a location
 *
 * @apiParam (URI Param) {Integer} htn_status - optional(if there is dm_status)
 * @apiParam (URI Param) {Integer} dm_status - optional(if there is htn_status)
 *
 * @apiSuccess {Object[]} patients object
 *
 * Sample request
 *  GET /298/2020-05/?hnStatus=7285
 *
 */
router.get('/:locationId/:month/', function (req, res) {

    // get month and location from url
    const locationId = req.params.locationId;
    const month = req.params.month;

    //get htn_status if available from query params
    const htnStatus = req.query.htn_status;

    //get dm_status if available from query params
    const dmStatus = req.query.dm_status;

    //if there is no htn_status or dm status, just return 400 error a.k.a user request invalid
    if (!dmStatus && !htnStatus) {
        res.status(400);
        return res.send({
            error: 'You need to provide either htnStatus or dmStatus in the query params  '
        });
    }

    let sqlQuery = 'SELECT patient.name, location.name, patient.gender' +
        'DATE_FORMAT(encounter_datetime,"%Y-%m-%d") AS date_encountered, ' +
        'TIMESTAMPDIFF(YEAR, patient.dob, CURDATE()) AS age ' + //age equals diff btwn today and dob
        'FROM flat_cdm_summary ' +
        'LEFT JOIN location ' +
        'ON ' +
        'location.id = flat_cdm_summary.location_id ' +
        'LEFT JOIN patient ' +
        'ON patient.patient_id = flat_cdm_summary.patient_id  ' +
        'WHERE DATE_FORMAT(encounter_datetime,"%Y-%m") = ? ' +
        'AND location_id= ? ';

    let value;
    //add the respective conditional queries into the sql statement
    if (dmStatus) {
        sqlQuery += 'AND flat_cdm_summary.dm_status=?';

        value = dmStatus;//having this here makes life easier
    } else {
        sqlQuery += 'AND flat_cdm_summary.htn_status=?';

        value = htnStatus;//also this
    }

    //parameters required in following order: 1)month, 2)location id, 3) htn or dm status value
    db.query(sqlQuery, [month, locationId, value], (error, results) => {
        if (error) {
            console.log(error);
            res.status(500);
            return res.send({
                error: 'Server error'
            });
        }

        res.send({
            patients: results
        })
    });


})


module.exports = router
