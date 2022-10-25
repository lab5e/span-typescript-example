/**
 * 0.1 Import fetch as it's not bundled for node < v17.x and util functions
 */
import fetch from "node-fetch";
import { requireEnv } from "../util/config";

/**
 * 1. Import the CollectionsApi object from Lab5e TypeScript fetch-api
 */
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
