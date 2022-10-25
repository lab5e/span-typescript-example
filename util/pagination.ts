import { OutputDataMessage } from "@lab5e/ts-fetch-spanapi";

/**
 * The max data we should return for a single service query
 */
export const MAX_DATA_LIMIT = 100000;

/**
 * The max data query limit per query
 */
export const MAX_QUERY_LIMIT = 256;

/**
 * Get the optiomal fetch limit for the next data query
 *
 * @param numEntriesSoFar The number of entries retrieved so far
 * @param numEntriesWanted The total number of entries wanted
 * @returns The new fetch limit based on given values and max data limits
 */
export function getFetchLimit(
  numEntriesSoFar: number,
  numEntriesWanted: number
): number {
  const diffInWanted = numEntriesWanted - numEntriesSoFar;

  if (diffInWanted <= 0) {
    return 0;
  }

  return diffInWanted > MAX_QUERY_LIMIT ? MAX_QUERY_LIMIT : diffInWanted;
}

/**
 * Get the earliest received date from a list of data messages
 *
 * @param outputDataMessages A list of OutputDataMessages
 * @returns The earliest Date from a list of data messages
 */
export function getEarliestDateFromTimestamp(
  outputDataMessages: OutputDataMessage[]
): Date {
  if (outputDataMessages.length === 0) {
    return new Date(0);
  } else {
    return new Date(
      parseInt(
        outputDataMessages[outputDataMessages.length - 1].received || "0",
        10
      )
    );
  }
}
