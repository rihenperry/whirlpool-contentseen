const mongoose = require('mongoose');
import authMongoDB from '../../helpers/config.js';

const contentDBSchema = new mongoose.Schema({
  misc: {type: mongoose.Schema.Types.Mixed, default: null},
  emp_type: {type: mongoose.Schema.Types.String, default: null},
  skills: {type: mongoose.Schema.Types.String, default: null},
  estimate: {type: mongoose.Schema.Types.String, default: null},
  description: {type: mongoose.Schema.Types.Mixed, default: null},
  url: mongoose.Schema.Types.String,
  title:{type: mongoose.Schema.Types.String, default: null},
  company: {type: mongoose.Schema.Types.String, default: null},
  location: {type: mongoose.Schema.Types.String, default: null},
  domain: mongoose.Schema.Types.String,
  job_posting_date: {type: mongoose.Schema.Types.String, default: null},
  created_at: {type: Date, default: Date.now}
});


export let WhirlpoolPage = mongoose.model('contentdb', contentDBSchema, 'contentdb');
