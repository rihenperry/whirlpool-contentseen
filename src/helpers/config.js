/*
 * Copyright (C) 2015-2017  Rihan Pereira
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {readFileSync} from 'fs';
const mongoose = require('mongoose');
const amqp = require('amqplib');
const Memcached = require('memcached');
const Sequelize = require('sequelize');
const util = require('util');

//app level imports
import logger from './applogging.js';

/* read configuration file for this application. */
let baseConfigFilename = 'config';
const configContents = readFileSync(`config/${baseConfigFilename}.json`);
const config = JSON.parse(configContents);

const log = logger(module);

const authMongoDB = async function() {
  let connstr = null;

  if (process.env.NODE_ENV === 'production') {
    connstr = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.DB}`;
  } else {
    let options = config.nosql;
    connstr = `mongodb://${options.username}:${options.password}@${options.hostname}:${options.port}/${options.dbname}`;
  }

  try {
    await mongoose.connect(connstr, { useNewUrlParser: true });
  } catch (error) {
    log.error('cannot connect to mongoose %', error);
    log.warn('cannot connect to mongoose %', error);
  }
};

mongoose.connection.on('connecting', () => {
  log.debug('connecting to %s mongodb', process.env.NODE_ENV);
});

mongoose.connection.on('connected', () => {
  log.info('connected to %s mongodb', process.env.NODE_ENV);
});

mongoose.connection.on('disconnected', function(){
  log.warn("%s mongodb disconnected", process.env.NODE_ENV);
});

process.on('SIGINT', function () {
  mongoose.connection.close(function() {
    log.warn("%s mongodb default connection is disconnected due to application termination",
             process.env.NODE_ENV);
    process.exit(0);
  });
});

let authPostgres = {
  conn: null,
  async connect() {
    if (process.env.NODE_ENV === 'production') {
      this.conn = new Sequelize(process.env.RDS_DB, process.env.RDS_USER, process.env.RDS_PWD, {
        host: process.env.RDS_ENDPOINT,
        port: process.env.RDS_PORT,
        dialect: 'postgres',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
    } else {
      this.conn = new Sequelize(config.sql.dbname, config.sql.username, config.sql.password, {
        host: config.sql.hostname,
        port: config.sql.port,
        dialect: 'postgres'
      });
    }

    this.conn
      .authenticate()
      .then(() => {
        log.info('connected to %s postgres db', process.env.NODE_ENV);
      })
      .catch((err) => {
        log.error('unable to connect to %s postgres db, err %s',
                  process.env.NODE_ENV,
                  util.inspect(err));
      });

    return this.conn;
  },
  async sequelize() {
    if (this.conn !== null) {
      log.debug('postgres yes');
      return this.conn;
    } else {
      log.debug('no postgres yet!');
      return this.connect();
    }
  }
};

let authMemCache = {
  memConn: null,
  async auth() {
    if (process.env.NODE_ENV === 'production') {
      this.memConn = `${process.env.MEMCACHE_ENDPOINT}:${process.env.MEMCACHE_PORT}`;
    } else {
      const params = config.memcache;
      this.memConn = `${params.hostname}:${params.port}`;
    }

    this.memConn = new Memcached(this.memConn);

    this.memConn.on('failure', function(details) {
      log.error( "memcached server %s went down due to: %s",
                 details.server,
                 details.messages.join( '' ));
    });

    this.memConn.on('reconnecting', function(details) {
      log.warn( "memcached total downtime caused by server %s: %s ms",
                details.server,
                details.totalDownTime );
    });

    log.info('connected to %s memcached node', process.env.NODE_ENV);

    return this.memConn;
  },
  async connect() {
    if (this.memConn === null) {
      log.debug('no memcache yet');
      return await this.auth();
    } else {
      log.debug('memcache yes');
      return this.memConn;
    }
  }
};

//register db models
import '../db/models/whirlpoolpages.js';
import '../db/models/content.js';

const authRMQ = async () => {
  let connection = null;

  try {
    log.debug('rabbitmq config %s', JSON.stringify(config.rabbitmq));
    connection = await amqp.connect(config.rabbitmq);

    log.info('authenticated to rabbitmq host %s, vhost %s as user %s',
             config.rabbitmq.hostname,
             config.rabbitmq.vhost,
             config.rabbitmq.username);
  } catch(e) {
    log.error('rabbitmq conn broken %s', e);
  }

  return connection;
};

export {authMongoDB, authPostgres, authRMQ, authMemCache};
