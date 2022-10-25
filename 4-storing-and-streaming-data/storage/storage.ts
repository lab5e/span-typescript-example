import { DataPoint } from "./models";

/**
 * DataStorage is a simple data interface which allows us
 * to create different types of storage at a later stage
 */
export interface DataStorage {
  init(): Promise<void>;

  listDataPoints(queryParam?: ListQueryParams): Promise<DataPoint[]>;
  addDataPoint(dataPoint: DataPoint): Promise<number>;
  addDataPoints(dataPoints: DataPoint[]): Promise<void>;

  close(): Promise<void>;
}

export interface ListQueryParams {
  limit?: number;
}
