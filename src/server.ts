import express from "express";
import prettyjson from "prettyjson";
import bodyParser from "body-parser";
import axios from "axios";
import { parse } from "csv-parse";
import fs from "fs";

const PORT = 3000;

const app = express();

app.use(bodyParser.json());

const options = {
  noColor: true,
};

// Initialize the parser
const parser = parse({
  delimiter: ",",
});

const myKey =
  "7383900e6349d6e256b8040f8d66f45d2c27ead8cefa6e776a0e4d2ffc02f775";

interface TokenItem {
  string: number;
}

// endpoint for fetching portfolio value per token i.e total of each token * token value
app.get("/", async (req, res) => {
  const tokensDeposited: TokenItem | {} = {};
  const tokensWithdrawn: TokenItem | {} = {};
  const tokensRemaining: TokenItem | {} = {};

  // fetch price for each token

  const dollarValue = await axios.get(
    "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD",
    {
      headers: {
        Authorization: `Apikey ${myKey}`,
      },
    }
  );

  // fetch all tokens & their amounts
  fs.createReadStream("transactions.csv")
    .pipe(parser)
    .on("data", (row) => {
      let tokenType = row[2];
      let transactionType = row[1];
      let transactionAmount = row[3];

      if (transactionType === "DEPOSIT") {
        if (tokensDeposited[tokenType] == undefined) {
          tokensDeposited[tokenType] = parseFloat(transactionAmount);
        } else {
          tokensDeposited[tokenType] += parseFloat(transactionAmount);
        }

        console.log(`${tokenType}:${transactionType}:${transactionAmount}`);
      } else {
        if (tokensWithdrawn[tokenType] == undefined) {
          tokensWithdrawn[tokenType] = parseFloat(transactionAmount);
        } else {
          tokensWithdrawn[tokenType] += parseFloat(transactionAmount);
        }
        console.log(`${tokenType}:${transactionType}`);
      }

      console.log("DEPOSITS:", tokensDeposited);
      console.log("WITHDRAWN:", tokensWithdrawn);
    })
    .on("end", () => {
      console.log("CSV file successfully processed");

      // console.log(dollarValue.data.BTC.USD);

      for (let item in tokensDeposited) {
        let totalTokens = tokensDeposited[item] - tokensDeposited[item];
        let tokenPrice = dollarValue.data[item].USD;
        // set dollar value for each token
        tokensRemaining[item] = totalTokens * tokenPrice;
      }

      console.log(tokensRemaining);
    });

  // return object with {token: value}
  res.status(200).send({ message: "Request is OK!" });
});

/* ***************************************************************************************************************** */

app.post("/token", async (req, res) => {
  const [token] = req.body;

  // fetch USD price per token
  const dollarValue = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`,
    {
      headers: {
        Authorization: `Apikey ${myKey}`,
      },
    }
  );

  const tokensDeposited: TokenItem | {} = {};
  const tokensWithdrawn: TokenItem | {} = {};
  const tokensRemaining: TokenItem | {} = {};

  // fetch all tokens & their amounts
  fs.createReadStream("transactions.csv")
    .pipe(parser)
    .on("data", (row) => {
      let tokenType = row[2];
      let transactionType = row[1];
      let transactionAmount = row[3];

      if (transactionType === "DEPOSIT" && tokenType === token) {
        if (tokensDeposited[tokenType] == undefined) {
          tokensDeposited[tokenType] = parseFloat(transactionAmount);
        } else {
          tokensDeposited[tokenType] += parseFloat(transactionAmount);
        }

        console.log(`${tokenType}:${transactionType}:${transactionAmount}`);
      } else {
        if (tokensWithdrawn[tokenType] == undefined) {
          tokensWithdrawn[tokenType] = parseFloat(transactionAmount);
        } else {
          tokensWithdrawn[tokenType] += parseFloat(transactionAmount);
        }
        console.log(`${tokenType}:${transactionType}`);
      }

      console.log("DEPOSITS:", tokensDeposited);
      console.log("WITHDRAWN:", tokensWithdrawn);
    })
    .on("end", () => {
      console.log("CSV file successfully processed");

      // console.log(dollarValue.data.BTC.USD);

      for (let item in tokensDeposited) {
        let totalTokens = tokensDeposited[item] - tokensDeposited[item];
        let tokenPrice = dollarValue.data[item].USD;
        // set dollar value for each token
        tokensRemaining[item] = totalTokens * tokenPrice;
      }

      console.log(tokensRemaining);
    });
});

/* ***************************************************************************************************************** */

app.post("/token/date", async (req, res) => {});

/* ***************************************************************************************************************** */

app.post("/date", async (req, res) => {});

/* ***************************************************************************************************************** */

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});