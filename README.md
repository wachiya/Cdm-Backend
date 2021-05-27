# Cdm-Backend

### Backend Challenge

The challenge was solved using Node Js platform.

### Prerequisites
- Node Js >=12
- NPM (usually installed with Node Js automatically)
- Internet connection as the database is remotely hosted

### NPM packages used
- Express Js ~ a minimal,flexible,& simple to use Node Js framework
- Dotenv  ~ we don't want to store the database credentials where anyone can access them !!
- Mysql ~ helps us connect with database and carry out some transactions against it.


### Setup Instructions
- Git clone the repository
- Cd into the cloned repository
- Copy `.env-sample` file to .env file `cp .env-sample .env`
- Update the database configurations in the resultant `.env above
- Install dependencies `npm i`
- Start the server  `npm start`
- The server will start at port `3000`. Visit your browser to confirm this at http://localhost:3000/.

### API endpoints
- All endpoints are available at `/api/v1/` namespace i.e.
`http://localhost:3000/api/v1`.
- Available endpoints include:

|Method| Endpoint|Description   | Example|
|---|---|---|---|
|GET| /patients | Fetch all patients in the database   | http://localhost:3000/api/v1/patients
|GET|  /search | Search a patient by name e.g.    | http://localhost:3000/api/v1/search?name=patient%201`
|GET| /reports/monthly   | Fetch CDM summary monthly report   |http://localhost:3000/api/v1/reports/monthly  |
|GET|/patients/{locationId}/{month}| Get all patients based on specific CDM summary reporting| http://localhost:3000/api/v1/patients/84/2021-05/?htn_status=7285

### How I arrived to CDM monthly report query

1) We exploit two MySql functions behavior:
- COUNT will never count a column with null value
- IF allows us to have condition and return a value e.g. null
Thus, after nesting both of them we have (aliases are output table column names e.g. `kb` is `Known Diabetic`):

```sql

SELECT DATE_FORMAT(encounter_datetime, '%Y-%m') AS MONTH,
       location_id,
       COUNT(IF(htn_status=7285, 1, NULL)) AS nh,
       COUNT(IF(htn_status=7286, 1, NULL)) AS kh,
       COUNT(IF(dm_status=7281, 1, NULL)) AS nb,
       COUNT(IF(dm_status=7282, 1, NULL)) AS kb,
       COUNT(IF(dm_status IS NOT NULL
                AND htn_status IS NOT NULL, 1, NULL)) AS hab,
FROM flat_cdm_summary
GROUP BY MONTH, location_id


```

2) Since we need the location name,we join the above data query with `location` table as follows:
```sql

SELECT location.name,
       location_id,
       DATE_FORMAT(encounter_datetime, '%Y-%m') AS MONTH,
       COUNT(IF(htn_status=7285, 1, NULL)) AS nh,
       COUNT(IF(htn_status=7286, 1, NULL)) AS kh,
       COUNT(IF(dm_status=7281, 1, NULL)) AS nb,
       COUNT(IF(dm_status=7282, 1, NULL)) AS kb,
       COUNT(IF(dm_status IS NOT NULL
              AND htn_status IS NOT NULL, 1, NULL)) AS hab
FROM flat_cdm_summary
LEFT JOIN LOCATION ON location.id = flat_cdm_summary.location_id
GROUP BY MONTH,
         flat_cdm_summary.location_id
````

