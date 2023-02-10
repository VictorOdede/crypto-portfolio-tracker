import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { parse } from "csv-parse";
import fs from "fs";
import { parse as dateParse } from "date-fns";
import {
  returnLatest,
  returnLatestToken,
  returnDateToken,
  returnDate,
} from "./utils";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const apiKey = process.env.API_KEY;

const app = express();

app.use(bodyParser.json());

// endpoint for fetching latest portfolio value for all tokens
app.get("/token", async (req, res) => {
  try {
    await returnLatest(apiKey);
    res.status(200).send({ message: "Request is OK!" });
  } catch (error) {
    res.status(404).send({ message: error });
    console.log(error);
  }
});

/* ***************************************************************************************************************** */

// endpoint for fetching latest portfolio value for a specified token
app.post("/token/latest", async (req: { body: { token: string } }, res) => {
  const { token } = req.body;
  if (token) {
    try {
      await returnLatestToken(apiKey, token);
      res.status(200).send({ message: "Request is OK!" });
    } catch (error) {
      res.status(404).send({ message: error });
      console.log(error);
    }
  } else {
    res.status(404).send({ message: "Invalid input" });
    console.log("ERROR: Invalid input");
  }
});

/* ***************************************************************************************************************** */

// endpoint for fetching portfolio value for a specified token up to a specified date
app.post(
  "/token/date",
  async (req: { body: { token: string; date: string } }, res) => {
    const { token, date } = req.body;
    if (token && date) {
      try {
        await returnDateToken(apiKey, token, date);
        res.status(200).send({ message: "Request is OK!" });
      } catch (error) {
        res.status(404).send({ message: error });
        console.log(error);
      }
    } else {
      res.status(404).send({ message: "Invalid input" });
      console.log("ERROR: Invalid input");
    }
  }
);

/* ***************************************************************************************************************** */

// endpoint for fetching portfolio value for all tokens up to a specified date
app.post("/date", async (req: { body: { date: string } }, res) => {
  const { date } = req.body;
  if (date) {
    try {
      const { date } = req.body;
      await returnDate(apiKey, date);
      res.status(200).send({ message: "Request is OK!" });
    } catch (error) {
      res.status(404).send({ message: error });
      console.log(error);
    }
  } else {
    res.status(404).send({ message: "Invalid input" });
    console.log("ERROR: Invalid input");
  }
});

/* ***************************************************************************************************************** */

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
