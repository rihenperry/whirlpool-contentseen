const _ = require('lodash');
const cheerio = require('cheerio');
const async = require('async');

import logger from '../helpers/applogging.js';

const log = logger(module);

/**
 * in DI terminology and static type paradigm, this class is injectable
 * DI basically means -> dont call us, we will call you.
 * @injectable
 **/

class MonsterExtract {
  static get _domain() {
    return "www.monster.com";
  }

  static get _otherdomain() {
    return "job-openings.monster.com";
  }

  constructor(doc_id, page) {
    this._doc_id = doc_id;
    this.page = cheerio.load(page, {
      withDomLvl1: true,
      normalizeWhitespace: true,
      xmlMode: false,
      decodeEntities: true
    });
  }

  /**
   * Given a page p, return text from html.
   * @returns {string}
   **/
  async xtext() {
    return new Promise((resolve, reject) => {
      let txt = {};
      let matchTest = [];
      const $ = this.page;

      matchTest.push($('#Content').hasClass('page-content'));
      matchTest.push($('#Content #JobViewHeader').hasClass('mux-card'));
      matchTest.push($('#Content #JobPreview').hasClass('row'));
      matchTest.push($('#Content #JobPreview #JobBody').hasClass('mux-job-details'));

      if (!_.includes(matchTest, false)) {
        txt.misc = {};
        txt.title = $('#Content #JobViewHeader .heading .title').text();
        txt.company = $('#AboutCompany h3').text();
        txt.estimate = $('#JobSalary .card-header').next().text().trim();
        let rawbody = $('#JobDescription').html();
        txt.body = rawbody.replace("\\s+", "").replace(/\t+/g, '').replace(/\n+/g, '').trim();;

        let details = $('#JobSummary .card-content .mux-job-summary').children();

        details.each((i, el) => {
          let anchor_k = $(el).find($('.header .key')).text();
          let anchor_v = $(el).find($('.header .value')).text();

          if (anchor_k === 'Location') {
            txt.location = $('#Content #JobViewHeader .heading .subtitle').text() || anchor_v;
          }

          if (anchor_k === 'Job type') {
            txt.emp_type = anchor_v;
          }

          if (anchor_k === 'Posted') {
            txt.job_posting_date = anchor_v;
          }

          if (anchor_k === 'Industries') {
            txt.misc.industry = anchor_v;
          }

        });

        resolve(txt);
      } else {
        resolve({});
      }
    });
  }
}

export default MonsterExtract;
