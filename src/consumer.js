import util from 'util';
const _ = require('lodash');
import mongoose from 'mongoose';
import path from 'path';

import logger from './helpers/applogging';
import DocExtractor from './helpers/extract.js';
import {pHash, pHashSeen, pHashSave} from './helpers/fp.js';

const log = logger(module);

export let contentSeenConsume = async function({rmqConn, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("contentseen.q", async function(msg) {
      let pgFromQ = JSON.parse(msg.content.toString());
      log.info('domain %s, locating page doc %s', pgFromQ.domain, pgFromQ._id);

      let HTMLMetaDB = mongoose.model('whirlpoolpage');
      let ContentDB = mongoose.model('contentdb');

      let queryHTMLDoc = HTMLMetaDB.findOne({_id: pgFromQ._id});

      queryHTMLDoc.exec(async (err, page) => {
        if (err) {
          reject(err);
        } else if (page && page.html.length !== 0) {
          log.info('domain %s, extracting doc %s', page.domain, page._id);

          // process the request, acknowledged and forget about it. No need to publish
          // to any exchange
          try {
            const xdoc = new DocExtractor(page.domain, pgFromQ.url, page._id, page.html);
            const txt = await xdoc.rawText();

            if (txt.toString('base64').length !== 0) {
              log.info(`hashing doc ${page._id}, domain ${page.domain}`);

              const h = await pHash(txt);

              if (await pHashSeen(h)) {
                log.info(`hash ${h} already exist. doc ${page._id}, domain ${page.domain} dropping`);
                xdoc.dropPage();
              } else {
                let content_id = mongoose.Types.ObjectId();
                let seenObj = {
                  page_fp: h,
                  page_type: 'nc',
                  whirlpool_page_id: page._id.toString(),
                  content_page_id: content_id.toString(),
                  domain: page.domain,
                  fp_alg: 'sha1'
                };
                Promise.all([pHashSave(seenObj), xdoc.save(content_id)])
                  .then(([hsave, psave]) => {
                    log.info(`doc ${page._id}, domain ${page.domain}. saved hash ${h} ${hsave}. saved page ${psave}`);
                    log.info(`doc ${page._id}, domain ${page.domain} dropping`);
                    xdoc.dropPage();
                  }).catch(error => {
                    log.error(`error collecting doc ${page._id}, domain ${page.domain}. ${error}`);
                  });
              }
            } else {
              log.warn(`doc ${page._id}, domain ${page.domain} is empty. dropping`);
              xdoc.dropPage();
            }

            //acknowledge consumer message
            await consumeChannel.ack(msg);
            resolve('consumer msg acknowledged of work done by contentseen_c');
          } catch (e) {
            reject(e);
          }
        } else {
          let m = `page ${pgFromQ._id} not found...`;
          log.warn(m);
          reject(m);
        }
      }); // end of queryHTMLDoc exec
    }); // end of consume channel

    // handle connection closed
    rmqConn.on("close", (err) => reject(err));

    // handle errors
    rmqConn.on("error", (err) => reject(err));

  }); //end of promise func
};
