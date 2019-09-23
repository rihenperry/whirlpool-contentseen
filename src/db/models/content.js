const mongoose = require('mongoose');
import authMongoDB from '../../helpers/config.js';

const contentDBSchema = new mongoose.Schema({
  details: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,
  ts: {type: Date, default: Date.now}
});


export let WhirlpoolPage = mongoose.model('contentdb', contentDBSchema, 'contentdb');
