/**
 * 0.1 Import fetch as it's not bundled for node < v17.x and util functions
 */
import fetch from "node-fetch";
import { requireEnv } from "../util/config";

/**
 * 1. Import the CollectionsApi object from Lab5e TypeScript fetch-api and mqtt
 */
import * as mqtt from "mqtt";
import { CollectionsApi, Configuration } from "@lab5e/ts-fetch-spanapi";

/**
 * 2 Initialize the CollectionsApi object with a configuration of your API key
 * and export as a const
 */
const [spanApiKey] = requireEnv(["SPAN_API_KEY"]);
export const collectionsClient = new CollectionsApi(
  new Configuration({
    apiKey: spanApiKey,
    fetchApi: fetch,
  })
);

/**
 * 3. Set up a collection data stream based of MQTT and given collection ID
 */
export const spanMQTThost = "tls://mqtt.lab5e.com:8883";
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
