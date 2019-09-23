/*
 * Copyright (C) Rihan Pereira <rihen234@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* eslint global-require: 'warn' */

import {authMongoDB, authPostgres, authMemCache, authRMQ} from './helpers/config';
import {contentSeenConsume as consume} from './consumer';
import logger from './helpers/applogging';

const log = logger(module);

async function listenForMessagesFromParserPublisher() {
  try {
    // connect to mongodb, postgres, memcache
    await authMongoDB();
    await authMemCache.connect();
    await authPostgres.connect();

    // connect to RabbitMQ Instance
    let rmqConn = await authRMQ();

    // create consumer channel and prefetch 1 message at a time
    let consumeChannel = await rmqConn.createChannel();
    await consumeChannel.prefetch(1);
    log.info('listening with prefetch 1 message at a time');

    // create publisher channel to send work produce to parser consumer via
    // fetch publisher
    let publishChannel = await rmqConn.createConfirmChannel();
    let ansConsume;

    ansConsume = await consume({rmqConn, consumeChannel, publishChannel});
    log.info(ansConsume);
  } catch (e) {
    log.error('consume function ', e);
  }
}


listenForMessagesFromParserPublisher();
