import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { parse } from "csv-parse";
import fs from "fs";
import { parse as dateParse } from "date-fns";

interface TokenItem {
  string: number;
}

export const returnDate = async (myKey: string, date: string) => {
  // Initialize the parser
  const parser = parse({
    delimiter: ",",
  });

  let parsedDate = dateParse(date, "dd/MM/yyyy", new Date());

  let millisecondsDate = Date.parse(parsedDate.toDateString());

  // fetch USD price per token
  const dollarValue = await axios.get(
    "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD",
    {
      headers: {
        Authorization: `Apikey ${myKey}`,
      },
    }
  );

  console.log(
    `Processing CSV data up to ${parsedDate.toDateString()}...This might take 2-3 minutes...`
  );

  const tokensDeposited: TokenItem | {} = {};
  const tokensWithdrawn: TokenItem | {} = {};
  const tokensRemaining: { string: string } | {} = {};

  // fetch all tokens & their amounts
  fs.createReadStream("transactions.csv")
    .pipe(parser)
    .on("data", (row) => {
      let transactionDate = row[0];
      let tokenType = row[2];
      let transactionType = row[1];
      let transactionAmount = row[3];

      if (
        transactionType === "DEPOSIT" &&
        parseInt(transactionDate) <= millisecondsDate
      ) {
        if (tokensDeposited[tokenType] == undefined) {
          tokensDeposited[tokenType] = parseFloat(transactionAmount);
        } else {
          tokensDeposited[tokenType] += parseFloat(transactionAmount);
        }
      } else if (
        transactionType === "WITHDRAWAL" &&
        parseInt(transactionDate) <= millisecondsDate
      ) {
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
      console.log("WITHDRAWALS:", tokensWithdrawn);

      for (let item in tokensDeposited) {
        let totalTokens = tokensDeposited[item] - tokensWithdrawn[item];

        // set dollar value for each token
        let tokenPrice = dollarValue.data[item].USD;
        tokensRemaining[item] = `${(totalTokens * tokenPrice).toFixed(2)} USD`;
      }
      console.log(`Total portfolio value on ${parsedDate.toDateString()}:`);
      console.log(tokensRemaining);
    });
};
