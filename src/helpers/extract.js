import mongoose from 'mongoose';
import util from 'util';
const _ = require('lodash');

import logger from '../helpers/applogging.js';
import injector from './injector.js';

const log = logger(module);

class DocExtractor {
  static get db() {
    return mongoose.model('whirlpoolpage');
  }

  constructor(domain, url, doc_id, page) {
    /**
     * demand an instance of extractor to get text from page
     * something like this -> this.extractor = new DiceExtract(doc_id, page);
     **/
    const ExtractDomain = injector.resolve(domain);
    this.extract = new ExtractDomain(doc_id, page);
    this._domain = ExtractDomain._domain;
    this._doc_id = doc_id;
    this._url = url;
    this._txt = {};
  }

  /**
   * if page p found. forward extracted links. forward page p for data extraction. return []
   * else drop html return empty []
   * @returns {list}
   **/
  async rawText() {
    try {
      let otxt = await this.extract.xtext();

      if (_.isEmpty(otxt)) {
        log.info('no text extracted %s', otxt);
        return '';
      } else {
        this._txt = otxt;
        let hash_filter = ['location', 'company', 'title', 'job_posting_date', 'skills'];
        let obj_to_hash = _.pickBy(this._txt, (v, k) => {
          return hash_filter.indexOf(k) !== -1;
        });
        return Buffer.from(Object.values(obj_to_hash).join('+'), 'utf8');
      }
    } catch (e) {
      log.error('error while extracting text %s', util.inspect(e));
      return e;
    }
  };

  /**
   * @returns {data, err}
   **/
  async save(content_id) {
    let self = this;
    return new Promise((resolve, reject) => {
      const ContentDB = mongoose.model('contentdb');

      let c = new ContentDB({
        _id: content_id,
        misc: self._txt.misc || null,
        description: self._txt.body,
        url: self._url,
        emp_type: self._txt.emp_type|| null,
        title: self._txt.title || null,
        estimate: self._txt.estimate || null,
        skills: self._txt.skills || null,
        company: self._txt.company || null,
        location: self._txt.location || null,
        domain: self._domain,
        job_posting_date: self._txt.job_posting_date || null
      });

      c.save((err) => {
        if (err) {
          reject(err);
        } else {
          log.info('nosql saved to contentdb collection');
          resolve(true);
        }
      });

    });
  }

  /**
   * @returns {void}
   **/
  dropPage() {
    let self = this;
    log.warn('dropping doc %s, domain %s', this._doc_id, this._domain);
    DocExtractor.db.deleteOne({_id: mongoose.Types.ObjectId(self._doc_id)}, function (err) {
      if (err) log.error('page %s unable to drop, %s', self._doc_id, util.inspect(err));
      log.info('doc %s dropped', self._doc_id);
    });
  }

}

export default DocExtractor;
