const mysql = require('mysql');
// load the configuration from Node process env object (hydrated by dotenv ~or docker if available).
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
}

const connection = mysql.createConnection(dbConfig);


connection.connect();

//Test the database connection works
connection.query('SELECT 1 ', function (error) {
    if (error) {
        //if there is an error, let us simply log that and throw a fatal error
        console.log(`Connection to db ${dbConfig.database}@${dbConfig.host}:${dbConfig.port} as ${dbConfig.user} failed`)
        throw error;
    }
    console.log(`Connected to db ${dbConfig.database}@${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
});

module.exports = connection;