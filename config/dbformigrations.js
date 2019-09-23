const fs = require('fs');

module.exports = {
  development: {
    username: "whirlpool_dev",
    password: "mado_0whirlpool8_dev",
    database: "whirlpoolmetadb",
    host: "whirlpool-postgres",
    dialect: "postgres",
    operatorsAliases: false
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false
  },
  production: {
    username: process.env.RDS_USER,
    password: process.env.RDS_PWD,
    database: process.env.RDS_DB,
    host: process.env.RDS_ENDPOINT,
    dialect: "postgres",
    operatorsAliases: false
  }
};
