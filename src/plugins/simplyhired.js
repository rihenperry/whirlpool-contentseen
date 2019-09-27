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

class SimplyHiredExtract {
  static get _domain() {
    return "www.simplyhired.com";
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

      matchTest.push($('.hybrid-container .row .col-md-8 .viewjob-paper').hasClass('viewjob-paper'));
      matchTest.push($('.viewjob-header').is('div'));
      matchTest.push($('.viewjob-description').is('div'));

      if (!_.includes(matchTest, false)) {

        txt.misc = {};
        txt.title = $('.viewjob-header h1').text();
        txt.company = $('.company').text();
        txt.location = $('.location').text();
        txt.estimate = $('.fa-briefcase').parent().next().text();
        txt.job_posting_date = $('.fa-clock-o').next().text();
        let rawbody = $('.viewjob-description').html();
        txt.body = rawbody.replace("\\s+", "").replace(/\t+/g, '').replace(/\n+/g, '').trim();

        let li = $('.viewjob-entities').children();
        li.each((i, e) => {
          if ($(e).is('span') && ($(e).text() === 'Education')) {
            let edu = [];
            $(e).next().children().each(function(i, el) {
              edu.push($(el).text());
            });
            txt.misc.education = edu.join(',');

          }

          if ($(e).is('span') && ($(e).text() === 'Skills')) {
            let ski = [];
            $(e).next().children().each(function(i, el) {
              ski.push($(el).text());
            });
            txt.skills = ski.join(',');
          }

          if ($(e).is('span') && ($(e).text() === 'Benefits')) {
            let bene = [];
            $(e).next().children().each(function(i, el) {
              bene.push($(el).text());
            });
            txt.misc.benefits = bene.join(',');
          }
        });

        txt.emp_type = $('.fa-briefcase').next().text();

        resolve(txt);
      } else {
        resolve({});
      }
    });
  }
}

export default SimplyHiredExtract;
