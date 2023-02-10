# Propine Engineering interview: Crypto portfolio tracker

## Overview

This is a portfolio tracker that fetches transaction data from a CSV and exchange rates from Cryptocompare API and uses the data to to return computed values. The code is written using **TypeScript** and **Node.JS** with **Express**.

## Approach

I executed a strategy that involved using a streaming approach for processing the CSV data. This was accomplished by partitioning the data into manageable chunks and temporarily storing it in a buffer. The objective of this technique was to safeguard against potential code failures that could arise from attempting to load the entire data set into memory, as the size of the CSV file is substantial and could result in memory exhaustion. Additionally, we are executing computations on each data row incrementally while the data is being streamed, allowing us to perform the necessary processing in real-time.


## Getting started

You can set up this project on your local computer using the following steps:

- Run `git clone <repository>` to clone this project to your local computer
- Open the root directory and run `npm install`
- Paste your CSV file into the root directory and make sure to name it `transactions.csv`
- Run `npm run dev` from the project directory to start the server.
- The server will run on `localhost: 3000`
- I have included my API key in the `.env` file for testing purposes but it is not a best practice to commit your `.env` file.

Once the server is running you can start making requests. You will see the logs on your terminal.

## Endpoints

The server is written using **express** and each endpoint is configured to have a single function. You can use Postman to send requests to your server. Kindly note: 
- The endpoints provided will only process JSON data.
  
- Make sure the `Content-Type` in your headers is set to `application/json`

### `localhost:3000/token`

This endpoint accepts a `GET` request which will call a function to process the CSV data and return the latest portfolio value for all the tokens.

### `localhost:3000/token/latest`

This endpoint accepts a `POST` request with a `token` value in the JSON object. This endpoint will call a function to process the CSV data and return the latest portfolio value for a specific token. Example of a valid JSON object:
        ```{
        "token": "ETH"
        }```

### `localhost:3000/token/date`

This endpoint accepts a `POST` request with a `token` and `date` value in the JSON object. The date value **MUST** follow the `dd/MM/yyyy` format. This endpoint will call a function to process the CSV data and return the latest portfolio value for a specific token up to a specified date. Example of a valid JSON object:
        ```{
        "token": "ETH",
        "date":"10/08/2022"
        }```

### `localhost:3000/date`

This endpoint accepts a `POST` request with a `date` value in the JSON object. The date value **MUST** follow the `dd/MM/yyyy` format. This endpoint will call a function to process the CSV data and return the latest portfolio value for all the tokens up to a specified date. Example of a valid JSON object:
        ```{
        "date":"10/08/2022"
        }```
