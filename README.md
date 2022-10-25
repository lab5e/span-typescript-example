# Span TypeScript example

This repo contains some examples and walkthroughs on how to integrate towards [Span](https://console.lab5e.com).

## Prerequesites

- Node 15>=

## Installation

To run the examples you need to install some dependencies. This is done by running

```bash
npm install
```

## Examples

We've put together some steps towards a real life example where we start from scratch, create a project in TypeScript and use [`tsx`](https://github.com/esbuild-kit/tsx#readme) for running the examples without any more hassle. We slowly evolve from initiating the API client and move on to fetching data, streaming data, and lastly storing data. After that, exposing the data at a later point would be trivial and application specific based on your needs

### Example 1 - Setting up the client

Example 1 can be found in the [1-setting-up-the-client folder](/1-setting-up-the-client/)

#### Ex 1 prerequisite

- API key exposed through an environmen variable as `SPAN_API_KEY` (can be created at the [Span Console](https://console.lab5e.com) under [/tokens](https://console.lab5e.com/tokens)). The API key needs to have READ access to all collections.

#### Ex 1 description

A quick simple "how to set up your client".

We use the given API key in the environment variables and list all the available collections which is connected to the API key and your account.

To run example 1, run the following command

```bash
npm run example-1
```

It should then list tabular data of your collections. Super simple!

### Example 2 - Fetching data

Example 1 can be found in the [2-fetching-data folder](/2-fetching-data/)

#### Ex 2 prerequisite

- API key exposed through an environment variable as `SPAN_API_KEY` (can be created at the [Span Console](https://console.lab5e.com) under [/tokens](https://console.lab5e.com/tokens)). The key needs to have READ access to either all collections, or the specific collection used.
- Collection ID to be used to fetch data, exposed as `SPAN_COLLECTION_ID`
- A collection with a device that holds some data

#### Ex 2 description

Now we're accessing a specific collection, which holds information about devices, but also data from these devices.

We use the given API key and list the 20 last data points available for the given colletion id.

To run example 2, run the following command

```bash
npm run example-2
```

It should then list the collection data. Equally simple!

### Example 3 - Streaming data

Example 3 can be found in the [3-streaming-data](/3-streaming-data/)

#### Ex 3 prerequisite

- API key exposed through an environment variable as `SPAN_API_KEY` (can be created at the [Span Console](https://console.lab5e.com) under [/tokens](https://console.lab5e.com/tokens)). The key needs to have READ access to either all collections, or the specific collection used.
- Collection ID to be used to fetch data, exposed as `SPAN_COLLECTION_ID`
- A collection with a device that has a device that sends some data

#### Ex 3 description

Now we're getting to the good part, streaming live data from your devices. We're setting up an MQTT client towards Span. After that we wait for 60s and watch for data, and handle the incoming data in a callback. Right now we're simply logging the payload, but as we can see in example 4, we can as an example store the data.

To run example 3, run the following command

```bash
npm run example-3
```

It should then start a MQTT client towards Span, and use the given credentials to stream data live from Span.

### Example 4 - Storing data

Example 4 can be found in the [4-storing-and-streaming-data](/4-storing-and-streaming-data/)

#### Ex 4 prerequisite

- API key exposed through an environment variable as `SPAN_API_KEY` (can be created at the [Span Console](https://console.lab5e.com) under [/tokens](https://console.lab5e.com/tokens)). The key needs to have READ access to either all collections, or the specific collection used.
- Collection ID to be used to fetch data, exposed as `SPAN_COLLECTION_ID`
- A collection with a device that has some historic data
- A collection with a device that has a device that sends some data

#### Ex 4 description

Time to put it all together. We first creating a local database using [Sqlite3](https://www.sqlite.org/index.html), and primes it with a [simple schema](./4-storing-and-streaming-data/storage/sqlite.ts) including some columns such as local id, the span id, when we retrieved the data, when the data was received from span, and the payload as a string.

As we at first don't have any data, we fetch the data for the last week (with a limit of 100k messages, just because). We then store the messages fetched, and immediately start a data stream from span and starts to feed the database with new messages as they arrive. The stream is up for 2 minutes, before it gracefully shuts down. However, the next time we load the example, we'll reuse the database, fetch the latest datapoint and backfill the missing data points, and starts a stream again.

To run example 4, run the following command

```bash
npm run example-4
```

Whether a database exists or not, we either backfill or fill the DB initially and then start a stream.
