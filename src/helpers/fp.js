const crypto = require('crypto');
const fs = require('fs');
const Sequelize = require('sequelize');

//const SeenTest = require('../db/models/seentest.js');
import {authPostgres as db} from '../helpers/config.js';
import SeenTestModel from '../db/models/seentest.js';

import logger from './applogging';
const log = logger(module);


const pHash = async (f) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    //const input = fs.createReadStream(f, {encoding: 'utf8'});

    hash.update(f.toString());
    let h = hash.digest('hex');
    resolve(h);

    //input.on('data', (d) => {  hash.update(d); });
    //input.on('end', () => {
    //  let h = hash.digest('hex');
    //  log.info(`${h}, ${f}`);
    //  resolve(h);
    //});
  }); // returns a promise
};

/**
 * @returns {data, err}
 **/
const pHashSeen = async (h) => {
  return new Promise (async (resolve, reject) => {
    const sequelize = await db.sequelize();
    const SeenTest = SeenTestModel(sequelize, Sequelize.DataTypes);

    SeenTest.findOne({where: {page_fp: h}}).then((seen) => {
      if (seen !== null) {
        log.warn(`doc_id ${seen.get('doc_id')}, domain ${seen.get('domain')}. duplicate copy found. hash ${seen.get('page_fp')}`);
        resolve(true);
      } else {
        log.warn(`hash ${h} not found`);
        resolve(false);
      }
    }); // sql query
  }); // end of promise
};

/**
 * @returns {data, err}
 **/
const pHashSave = async (obj) => {
  return new Promise(async (resolve, reject) => {
    const sequelize = await db.sequelize();
    const SeenTest = SeenTestModel(sequelize, Sequelize.DataTypes);

    SeenTest.create(obj).then((seen) => {
      if (seen !== null) {
        log.info(`sql saved object ${seen}`);
        resolve(true);
      } else {
        log.error(`sql object not saved ${seen}`);
        reject(seen);
      }
    });
  });
};

export {pHash, pHashSeen, pHashSave};
