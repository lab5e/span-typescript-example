/**
 * 0.1 Import util functions
 */
import { requireEnv } from "../util/config";

/**
 * 1. Import the collectionsClient from the span-file
 */
import { collectionsClient } from "./span";

/**
 * 2. List data for a single collection and print data to console
 */
(async () => {
  /**
   * 2.1 Set the ID of the collection you want to list data from
   */
  const [collectionId] = requireEnv(["SPAN_COLLECTION_ID"]);

  await collectionsClient
    .listCollectionData({ collectionId, limit: 20 })
    .then((response) => {
      console.table(response.data ?? []);
    })
    .catch(async (errorResponse: Response) => {
      console.error(
        `Error when trying to list data: ${errorResponse.statusText}`,
        errorResponse.headers.get("Content-Type")?.includes("application/json")
          ? await errorResponse.json()
          : await errorResponse.text()
      );
    });
})();
