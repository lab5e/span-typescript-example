/**
 * 1. Import the collectionsClient from the span-file
 */
import { collectionsClient } from "./span";

(async () => {
  /**
   * 2 Use client to list collections
   */
  await collectionsClient
    .listCollections()
    .then((response) => {
      console.table(response.collections ?? []);
    })
    .catch(async (errorResponse: Response) => {
      console.error(
        `Error when trying to list collections: ${errorResponse.statusText}`,
        errorResponse.headers.get("Content-Type")?.includes("application/json")
          ? await errorResponse.json()
          : await errorResponse.text()
      );
    });
})();
