const _ = require('lodash');
const cheerio = require('cheerio');
const async = require('async');
const util = require('util');

import logger from '../helpers/applogging.js';

const log = logger(module);

/**
 * in DI terminology and static type paradigm, this class is injectable
 * DI basically means -> dont call us, we will call you.
 * @injectable
 **/

class DiceExtract {
  static get _domain() {
    return "www.dice.com";
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

      matchTest.push($('#jt').hasClass('jobTitle'));
      matchTest.push($('#jt').next().hasClass('list-inline'));
      matchTest.push($('#jt').next().children().first().children().first().hasClass('dice-btn-link'));
      matchTest.push($('#bd').hasClass('job-details'));
      matchTest.push($('#jobdescSec').hasClass('highlight-black'));

      if (!_.includes(matchTest, false)) {
        let detail = $('#jt').next().text().trim();
        let newDetail = detail.replace("\\s+", "").replace(/\t+/g, '').replace(/\n+/g, '.').trim();

        let body = $('#jobdescSec').html();
        let newBody = body.replace("\\s+", "").replace(/\t+/g, '').replace(/\n+/g, '').trim();

        let tmp = newDetail.length !== 0 ? newDetail.split('.'): [];

        txt.title = $('#jt').text();
        txt.company = $('#compNameSSDL').attr('value');
        txt.location = $('#estJLoc').attr('value');
        txt.job_posting_date = tmp[tmp.length-1];
        txt.body = newBody;
        txt.estimate = $('.icon-bank-note').parent().next().text();
        txt.skills = $('#estSkillText').attr('value');
        txt.emp_type = $('#empTypeSSDL').attr('value') || $('#taxTermsTextId').attr('value');
        txt.misc = {
          other: $('.icon-network-2').parent().next().text()
        };

        resolve(txt);
      } else {
        resolve({});
      }
    });
  }
}

export default DiceExtract;
