import axios from "axios";
import fs from "fs";
import { parse } from "csv-parse";

export const returnLatest = async (myKey: string) => {
  // Initialize the parser
  const parser = parse({
    delimiter: ",",
  });

  interface TokenItem {
    string: number;
  }

  const tokensDeposited: TokenItem | {} = {};
  const tokensWithdrawn: TokenItem | {} = {};
  const tokensRemaining: { string: string } | {} = {};

  // fetch price for each token

  const dollarValue = await axios.get(
    "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD",
    {
      headers: {
        Authorization: `Apikey ${myKey}`,
      },
    }
  );

  console.log(
    `Processing CSV data for latest portfolio values...This might take 2-3 minutes...`
  );

  // read CSV file to fetch all tokens & their amounts
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

        // console.log(`${tokenType}:${transactionType}:${transactionAmount}`);
      } else {
        if (tokensWithdrawn[tokenType] == undefined) {
          tokensWithdrawn[tokenType] = parseFloat(transactionAmount);
        } else {
          tokensWithdrawn[tokenType] += parseFloat(transactionAmount);
        }
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");

      console.log("DEPOSITS:", tokensDeposited);
      console.log("WITHDRAWN:", tokensWithdrawn);

      for (let item in tokensDeposited) {
        let totalTokens = tokensDeposited[item] - tokensWithdrawn[item];
        let tokenPrice = dollarValue.data[item].USD;
        // set dollar value for each token
        tokensRemaining[item] = `${(totalTokens * tokenPrice).toFixed(2)} USD`;
      }
      console.log(`Latest portfolio value is:`);
      console.log(tokensRemaining);
    });
};
