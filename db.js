const sql = require('mssql');
require('dotenv').config();
console.log("USER:", process.env.USER);
console.log("DBPASS:", process.env.DBPASS);
console.log("DBSERVER:", process.env.DBSERVER);
console.log("DB1:", process.env.DB1);
console.log("DB2:", process.env.DB2);

const config = {
    user: process.env.USER,
    password: process.env.DBPASS,
    server: process.env.DBSERVER,
    database: process.env.DB1,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL (DB1)');
        return pool;
    })
    .catch(err => {
        console.error('Error connecting to MSSQL (DB1):', err);
        process.exit(1);
    });

const config2 = {
    user: process.env.USER,
    password: process.env.DBPASS,
    server: process.env.DBSERVER,
    database: process.env.DB2,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise2 = new sql.ConnectionPool(config2)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL (DB2)');
        return pool;
    })
    .catch(err => {
        console.error('Error connecting to MSSQL (DB2):', err);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise,
    poolPromise2
};
