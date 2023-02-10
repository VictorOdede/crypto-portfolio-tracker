import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { parse } from "csv-parse";
import fs from "fs";
import { parse as dateParse } from "date-fns";

interface TokenItem {
  string: number;
}

export const returnDateToken = async (myKey, token, date) => {
  // Initialize the parser
  const parser = parse({
    delimiter: ",",
  });

  let parsedDate = dateParse(date, "dd/MM/yyyy", new Date());

  let millisecondsDate = Date.parse(parsedDate.toDateString());

  // fetch USD price per token
  const dollarValue = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`,
    {
      headers: {
        Authorization: `Apikey ${myKey}`,
      },
    }
  );

  console.log(
    `Processing CSV data for ${token} up to ${parsedDate.toDateString()}...This might take 2-3 minutes...`
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
        tokenType === token &&
        parseInt(transactionDate) <= millisecondsDate
      ) {
        if (tokensDeposited[token] == undefined) {
          tokensDeposited[token] = parseFloat(transactionAmount);
        } else {
          tokensDeposited[token] += parseFloat(transactionAmount);
        }
      } else if (
        transactionType === "WITHDRAWAL" &&
        tokenType === token &&
        parseInt(transactionDate) <= millisecondsDate
      ) {
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

      console.log(
        `Total portfolio value for ${token} on ${parsedDate.toDateString()}:`
      );

      console.log(tokensRemaining);
    });
};
