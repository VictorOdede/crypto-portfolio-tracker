- Overview

This is a portfolio tracker that fetches transaction data from a CSV and exchange rates from Cryptocompare API. The code is written using **TypeScript** and **Node.JS** with **Express**.

- Approach

The approach that I implemented was to stream the CSV data by converting the text into Buffers. This is done in order to prevent the code from breaking. Since the CSV file is very large it may cause us to run out of memory if we read the file directly. We are also computing the data line by line in order to perform effects while streaming.

The server is written using **express** and each endpoint is configured to have a single function.

- Getting started

You can set up this project on your local computer using the following steps:

- Run `git clone <repository>` to clone this project to your local computer
- Open the root directory and run `npm install`
- Paste your CSV file into the root directory and make sure to name it `transactions.csv`
- Run `npm run dev` from the project directory to start the server.
- The server will run on `localhost: 3000`
- I have included my API key in the `.env` file for testing purposes but it is not a best practice to commit your `.env` file.

Once the server is running you can start making requests. You will see the logs on your terminal.

- Endpoints

The endpoints provided will only process JSON data. You can use Postman to test the endpoints locally. Make sure the `Content-Type` in your Headers is set to `application/json`

\*\*\* `localhost:3000/token`

This endpoint accepts a `GET` request which will call a function to process the CSV data and return the latest portfolio value for all the tokens.

\*\*\* `localhost:3000/token/latest`

This endpoint accepts a `POST` request with a `token` value in the JSON object. This endpoint will call a function to process the CSV data and return the latest portfolio value for a specific token. Example of a valid JSON object:
{
"token": "ETH"
}

\*\*\* `localhost:3000/token/date`

This endpoint accepts a `POST` request with a `token` and `date` value in the JSON object. The date value **MUST** follow the `dd/MM/yyyy` format. This endpoint will call a function to process the CSV data and return the latest portfolio value for a specific token up to a specified date. Example of a valid JSON object:
{
"token": "ETH",
"date":"10/08/2022"
}

\*\*\* `localhost:3000/date`

This endpoint accepts a `POST` request with a `date` value in the JSON object. The date value **MUST** follow the `dd/MM/yyyy` format. This endpoint will call a function to process the CSV data and return the latest portfolio value for all the tokens up to a specified date. Example of a valid JSON object:
{
"date":"10/08/2022"
}
