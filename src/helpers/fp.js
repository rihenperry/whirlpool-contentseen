const crypto = require('crypto');
const fs = require('fs');

const sqlModels = require('../db/models');
import logger from './helpers/applogging';
const log = logger(module);

const pHash = async (f) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    const input = fs.createReadStream(f, {encoding: 'utf8'});

    input.on('data', (d) => {  hash.update(d); });
    input.on('end', () => {
      let h = hash.digest('hex');
      log.info(`${h}, ${f}`);
      resolve(h);
    });
  }); // returns a promise
};

/**
 * @returns {data, err}
 **/
const pHashSeen = async (h) => {
  return new Promise ((resolve, reject) => {
    sqlModels.SeenTest.findOne({page_fp: h}).then((seen) => {
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
  return new Promise((resolve, reject) => {
    sqlModels.SeenTest.create(obj).then((seen) => {
      if (seen !== null) {
        log.info(`saved object ${seen}`);
        resolve(true);
      } else {
        log.error(`sql object not saved ${seen}`);
        reject(seen);
      }
    });
  });
};

export {pHash, pHashSeen, pHashSave};
