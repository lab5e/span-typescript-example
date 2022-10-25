import { OutputDataMessage } from "@lab5e/ts-fetch-spanapi";
import { format, subDays, subHours, subMonths } from "date-fns";

import { setTimeout } from "timers/promises";
import { requireEnv } from "../util/config";
import { SqliteStorage } from "./storage/sqlite";
import { createCollectionDataStream, listCollectionData } from "./span";
import { DataStorage } from "./storage/storage";

/**
 * STREAM_WAIT_TIME is the number of milliseconds to wait for data on the stream
 * before closing the session and exiting the program.
 */
const STREAM_WAIT_TIME = 2 * 60 * 1000;

(async () => {
  const [collectionId] = requireEnv(["SPAN_COLLECTION_ID"]);
  console.log(`Using collection with ID ${collectionId}.`);

  /**
   * Initiating storage. Here we're using the implementation of DataStorage
   * provided by the SqliteStorage, but you can implement any types of storage
   * here
   */
  const dataStorage: DataStorage = new SqliteStorage();
  await dataStorage.init();

  /**
   * List last datapoint and use it to find the latest date we have data for
   */
  const dataPoints = await dataStorage.listDataPoints({ limit: 1 });
  let since = format(subDays(new Date(), 7), "T");
  if (dataPoints.length > 0) {
    since = dataPoints[0].spanReceived;
  }

  const sinceDate = new Date(parseInt(since, 10) + 1);
  console.log(`Querying for data since '${sinceDate}'`);

  /**
   * List all data since the last data point we have. If we do not have any
   * data points, we simply ask for data starting a month ago. The listCollectionData
   * has an internal maximum of 100k entries, but this can be changed according to your
   * needs.
   */
  const collectionData = await listCollectionData(collectionId, {
    since: sinceDate,
  });

  console.log(`Fetched ${collectionData.length} entries from Span`);
  /**
   * Add all data points to local storage using our data store
   */
  await dataStorage.addDataPoints(
    collectionData.reverse().map((message) => {
      return {
        id: -1,
        createdAt: new Date(),
        rawData: message.payload ?? "",
        spanId: message.messageId ?? "",
        spanReceived: message.received ?? "",
      };
    })
  );

  /**
   * Create collection data stream and add data as they come
   */
  const mqttStream = createCollectionDataStream(collectionId);
  mqttStream.on("message", async (topic, message) => {
    const dataMessage = JSON.parse(message.toString()) as OutputDataMessage;
    console.log(`Got stream message on topic '${topic}'. Storing in DB.`);

    await dataStorage.addDataPoint({
      id: -1,
      createdAt: new Date(),
      spanId: dataMessage.messageId ?? "",
      spanReceived: dataMessage.received ?? "",
      rawData: dataMessage.payload ?? "",
    });
  });

  /**
   * Wait for data in given amount of time
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
    await dataStorage.close(),
  ]).catch((err) => {
    console.error("Closed unsuccesfully", err);
    process.exit(1);
  });

  console.error("Closed succesfully");
  process.exit(0);
})();
