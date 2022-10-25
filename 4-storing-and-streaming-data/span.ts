import fetch from "node-fetch";
import * as mqtt from "mqtt";

import {
  CollectionsApi,
  Configuration,
  OutputDataMessage,
} from "@lab5e/ts-fetch-spanapi";
import { requireEnv } from "../util/config";
import {
  getEarliestDateFromTimestamp,
  getFetchLimit,
  MAX_DATA_LIMIT,
} from "../util/pagination";
import { format } from "date-fns";

export const spanMQTThost = "tls://mqtt.lab5e.com:8883";

const [spanApiKey] = requireEnv(["SPAN_API_KEY"]);

export const collectionsClient = new CollectionsApi(
  new Configuration({
    apiKey: spanApiKey,
    fetchApi: fetch,
  })
);

export const createCollectionDataStream = (
  collectionId: string
): mqtt.MqttClient => {
  console.info(
    `Initiating collection data stream for collection ID '${collectionId}' for live data`
  );
  const client = mqtt.connect(spanMQTThost, {
    username: collectionId,
    password: spanApiKey,
  });

  client.on("connect", () => {
    console.info("MQTT client connected");

    // Subscribe to everything
    client.subscribe("#", (err) => {
      if (!err) {
        console.info(`Successfully subscribed to # (everything)`);
      }
    });
  });

  client.on("error", (error) => {
    console.error("Error received on MQTT client:", error.message);
    process.exit(1);
  });

  client.on("close", () => {
    console.info("Received close for MQTT client");
  });
  client.on("reconnect", () => {
    console.info("MQTT client reconnected");
  });

  client.on("disconnect", () => {
    console.error("MQTT client disconnected");
    process.exit(1);
  });

  return client;
};

export interface DataSearchParameters {
  limit?: number;
  since?: Date;
  until?: Date;
}

export const listCollectionData = async (
  collectionId: string,
  {
    limit = undefined,
    since = new Date(0),
    until = new Date(),
  }: DataSearchParameters = {}
): Promise<OutputDataMessage[]> => {
  const totalEntriesWanted = limit || MAX_DATA_LIMIT;
  let dataList: OutputDataMessage[] = [];

  let fetchMore = true;
  let fetchLimit = getFetchLimit(0, totalEntriesWanted);
  let fetchUntil = until;

  while (fetchMore) {
    const fetchedData = await collectionsClient
      .listCollectionData({
        collectionId: collectionId,
        end: format(fetchUntil, "T"),
        limit: fetchLimit,
        start: format(since, "T"),
      })
      .then((result) => result.data || []);

    dataList = dataList.concat(fetchedData);

    // If the result is lower than the limit or we have reached the total limit, we're done.
    if (
      fetchedData.length !== fetchLimit ||
      dataList.length === totalEntriesWanted
    ) {
      fetchMore = false;
    } else {
      fetchUntil = getEarliestDateFromTimestamp(dataList);
      fetchLimit = getFetchLimit(dataList.length, totalEntriesWanted);
    }
  }
  return dataList;
};
