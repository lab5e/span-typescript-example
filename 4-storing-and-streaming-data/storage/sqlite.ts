import { existsSync } from "node:fs";
import * as sqlite3 from "sqlite3";
import { DataPoint } from "./models";
import { DataStorage, ListQueryParams } from "./storage";

const sqliteSchema = `
CREATE TABLE IF NOT EXISTS datapoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  spanId TEXT NOT NULL,
  spanReceived TEXT NOT NULL,
  rawData TEXT
)
`.trim();
const DB_NAME = "data.db";

/**
 * SqliteStorage is a simple data storage backed by Sqlite3
 * which allows for persistent storage of data points
 */
export class SqliteStorage implements DataStorage {
  private db: sqlite3.Database;

  constructor() {
    if (existsSync(DB_NAME)) {
      console.info(
        `Found existing DB '${DB_NAME}', loading and using as persistent storage`
      );
    } else {
      console.info(`Creating new DB '${DB_NAME}' for persistent storage.`);
    }
    this.db = new (sqlite3.verbose().Database)(DB_NAME);
  }

  /**
   * Initialize the Sqlite3 data schema
   *
   * @returns Promise which resolves when DB has been initialized
   */
  async init(): Promise<void> {
    return new Promise((res, rej) => {
      this.db.run(sqliteSchema, (err) => {
        if (err !== null) {
          rej(err);
        }

        res();
      });
    });
  }

  /**
   * List data points from the persistent Sqlite3 storage
   *
   * @param ListQueryParams Optional details on how many datapoints to list
   * @returns A Promise which resovles as DataPoints based on given ListQueryParams
   */
  async listDataPoints({ limit = 10 }: ListQueryParams = {}): Promise<
    DataPoint[]
  > {
    return new Promise((res, rej) => {
      const dataPoints: DataPoint[] = [];

      this.db.each(
        "SELECT * FROM datapoints ORDER BY id DESC LIMIT ?",
        [limit],
        (err, row) => {
          if (err != null) {
            rej(err);
          }

          dataPoints.push({
            id: row.id,
            createdAt: new Date(row.createdAt),
            spanId: row.spanId,
            spanReceived: row.spanReceived,
            rawData: row.rawData,
          });
        },
        () => {
          res(dataPoints);
        }
      );
    });
  }

  /**
   * Add a single data point to the persistent storage
   *
   * @param dataPoint DataPoint to add to storage
   * @returns Promise with the new ID of the data point
   */
  async addDataPoint(dataPoint: DataPoint): Promise<number> {
    return new Promise((res, rej) => {
      this.db.run(
        "INSERT INTO datapoints(spanId, spanReceived, rawData) VALUES(?,?,?)",
        [dataPoint.spanId, dataPoint.spanReceived, dataPoint.rawData],
        function (err) {
          if (err !== null) {
            rej(err);
          } else {
            res(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Add an array of data points
   *
   * @param dataPoints A list of DataPoints to add to storage
   * @returns A Promise which resolves when all data points has been stored
   */
  async addDataPoints(dataPoints: DataPoint[]): Promise<void> {
    return new Promise((res, rej) => {
      this.db.serialize(() => {
        const tx = this.db.exec("BEGIN TRANSACTION");

        dataPoints.forEach((dataPoint) => {
          this.db.run(
            "INSERT INTO datapoints(spanId, spanReceived, rawData) VALUES(?,?,?)",
            [dataPoint.spanId, dataPoint.spanReceived, dataPoint.rawData]
          );
        });

        this.db.exec("COMMIT");
        res();
      });
    });
  }

  async close() {
    return this.db.close();
  }
}
