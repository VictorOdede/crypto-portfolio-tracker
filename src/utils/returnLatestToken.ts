import axios from "axios";
import { parse } from "csv-parse";
import fs from "fs";

interface TokenItem {
  string: number;
}

export const returnLatestToken = async (myKey: string, token: string) => {
  // Initialize the parser
  const parser = parse({
    delimiter: ",",
  });

  const dollarValue = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`,
    {
      headers: {
        Authorization: `Apikey ${myKey}`,
      },
    }
  );

  console.log(
    `Processing CSV data for ${token}...This might take 2-3 minutes...`
  );

  const tokensDeposited: TokenItem | {} = {};
  const tokensWithdrawn: TokenItem | {} = {};
  const tokensRemaining: { string: string } | {} = {};

  // fetch all tokens & their amounts
  fs.createReadStream("transactions.csv")
    .pipe(parser)
    .on("data", (row) => {
      let tokenType = row[2];
      let transactionType = row[1];
      let transactionAmount = row[3];

      if (transactionType === "DEPOSIT" && tokenType === token) {
        if (tokensDeposited[token] == undefined) {
          tokensDeposited[token] = parseFloat(transactionAmount);
        } else {
          tokensDeposited[token] += parseFloat(transactionAmount);
        }
      } else if (transactionType === "WITHDRAWAL" && tokenType === token) {
        if (tokensWithdrawn[token] == undefined) {
          tokensWithdrawn[token] = parseFloat(transactionAmount);
        } else {
          tokensWithdrawn[token] += parseFloat(transactionAmount);
        }
      }
    })
    .on("end", () => {
      console.log("CSV file processed successfully");
      console.log("DEPOSITS:", tokensDeposited);
      console.log("WITHDRAWN:", tokensWithdrawn);

      let totalTokens = tokensDeposited[token] - tokensWithdrawn[token];
      let tokenPrice = dollarValue.data.USD;
      // set dollar value for each token
      tokensRemaining[token] = `${(totalTokens * tokenPrice).toFixed(2)} USD`;
      console.log(`Latets portfolio value for ${token}:`);
      console.log(tokensRemaining);
    });
};
