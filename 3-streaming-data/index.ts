/**
 * 0.1 Import convenience functions
 */
import { requireEnv } from "../util/config";
import { setTimeout } from "timers/promises";

/**
 * 1. Import data message type from API client and data stream function
 */
import { OutputDataMessage } from "@lab5e/ts-fetch-spanapi";
import { createCollectionDataStream } from "./span";

/**
 * STREAM_WAIT_TIME is the number of milliseconds to wait for data on the stream
 * before closing the session and exiting the program.
 */
const STREAM_WAIT_TIME = 60 * 1000;

/**
 * 2. Stream data for a single collection and print data to console
 */
(async () => {
  /**
   * 2.1 Get the id of the collection you want to stream data from
   */
  const [collectionId] = requireEnv(["SPAN_COLLECTION_ID"]);
  console.log(`Using collection with ID ${collectionId}.`);

  /**
   * Initiate mqtt client using our collection id
   */
  const mqttStream = createCollectionDataStream(collectionId);

  mqttStream.on("message", (topic, message) => {
    console.log(`Got message on topic '${topic}'`);
    const dataMessage = JSON.parse(message.toString()) as OutputDataMessage;
    console.info(dataMessage.payload);
  });

  /**
   * Wait a few seconds and look at data
   */
  console.log(`Watching for data for ${STREAM_WAIT_TIME / 1000}s`);
  await setTimeout(STREAM_WAIT_TIME);

  /**
   * Clean up
   */
  console.info("Closing down mqtt stream and data store");

  await Promise.all([
    new Promise<void>((res, rej) => {
      mqttStream.end(false, {}, (err) => {
        if (err) {
          rej(err);
        }

        res();
      });
    }),
  ]).catch((err) => {
    console.error("Closed unsuccesfully", err);
    process.exit(1);
  });

  console.info("Closed succesfully");
  process.exit(0);
})();
