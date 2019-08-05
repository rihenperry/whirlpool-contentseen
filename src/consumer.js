import logger from './helpers/applogging';

const log = logger(module);

export let contentSeenConsume = async function({connection, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("contentseen.q", async function(msg) {
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);

      log.info('contenteseen_c received request to process ', data);

      // process the request, acknowledged and forget about it. No need to publish
      // to any exchange

      try {
        await consumeChannel.ack(msg);
        log.info('consumer msg acknowledged of work done by contentseen_c');

        resolve('processed single message with durable confirmation');
      } catch (e) {
        return reject(e);
      }
    });

    // handle connection closed
    connection.on("close", (err) => {
      return reject(err);
    });

    // handle errors
    connection.on("error", (err) => {
      return reject(err);
    });
  });
};
