import mongoose from 'mongoose';
import util from 'util';

import logger from '../helpers/applogging.js';
import injector from './injector.js';

const log = logger(module);

class DocExtractor {
  static get db() {
    mongoose.model('whirlpoolpage');
  }

  constructor(domain, doc_id, page) {
    /**
     * demand an instance of extractor to get text from page
     * something like this -> this.extractor = new DiceExtract(doc_id, page);
     **/
    const ExtractDomain = injector.resolve(domain);
    this.extract = new ExtractDomain(doc_id, page);
    this._domain = ExtractDomain._domain;
    this.doc_id = doc_id;
    this.txt = {};
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
        return '';
      } else {
        this.txt = otxt;
        return Object.values(this.txt).join('+');
      }
    } catch (e) {
      log.error('error while extracting text %s', util.inspect(e));
    }
  };

  /**
   * @returns {data, err}
   **/
  async save() {
    return new Promise((resolve, reject) => {
      const ContentDB = mongoose.model('contentdb');
      let self = this;
      let c = new ContentDB({
        details: self.txt.details,
        body: self.txt.body
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
    log.warn('dropping doc %s, domain %s', this.doc_id, this._domain);
    DocExtractor.db.deleteOne({_id: mongoose.Types.ObjectId(self.doc_id)}, function (err) {
      if (err) log.error('page %s unable to drop, %s', self.doc_id, util.inspect(err));
      log.info('doc %s dropped', self.doc_id);
    });
  }

}
