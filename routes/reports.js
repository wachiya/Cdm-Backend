const express = require('express')
const router = express.Router()
const db = require('../utils/db')


/**
 * @api {get} /api/v1/reports/monthlu
 *
 * @description get summary aggregate grouped by month and location
 *
 * @apiSuccess {Object[]} report object
 *
 */
router.get('/monthly', function (req, res) {


    const sqlQuery = 'SELECT location.name, location_id, ' +
        'DATE_FORMAT(encounter_datetime,"%Y-%m") as month, ' +
        'COUNT(IF(htn_status=7285, 1, null)) as nh, ' +
        'COUNT(IF(htn_status=7286, 1, null)) as kh, ' +
        'COUNT(IF(dm_status=7281, 1, null)) as nb, ' +
        'COUNT(IF(dm_status=7282, 1, null)) as kb, ' +
        'COUNT(IF(dm_status IS NOT NULL and htn_status IS NOT NULL, 1, null)) as hab ' +
        'FROM flat_cdm_summary ' +
        'LEFT JOIN location ' +
        'ON ' +
        'location.id = flat_cdm_summary.location_id ' +
        'GROUP BY month,flat_cdm_summary.location_id ';

    db.query(sqlQuery, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500);
            return res.send({
                error: 'Server error'
            });
        }

        res.send({
            report: results
        })
    });


})


module.exports = router
