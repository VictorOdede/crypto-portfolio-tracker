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
  }
});

/* ***************************************************************************************************************** */

// endpoint for fetching latest portfolio value for a specified token
app.post("/token/latest", async (req, res) => {
  const { token } = req.body;

  try {
    await returnLatestToken(apiKey, token);
    res.status(200).send({ message: "Request is OK!" });
  } catch (error) {
    res.status(404).send({ message: error });
  }
});

/* ***************************************************************************************************************** */

// endpoint for fetching portfolio value for a specified token up to a specified date
app.post("/token/date", async (req, res) => {
  const { token, date } = req.body;

  try {
    await returnDateToken(apiKey, token, date);
    res.status(200).send({ message: "Request is OK!" });
  } catch (error) {
    res.status(404).send({ message: error });
  }
});

/* ***************************************************************************************************************** */

// endpoint for fetching portfolio value for all tokens up to a specified date
app.post("/date", async (req, res) => {
  const { date } = req.body;

  try {
    await returnDate(apiKey, date);
    res.status(200).send({ message: "Request is OK!" });
  } catch (error) {
    res.status(404).send({ message: error });
  }
});

/* ***************************************************************************************************************** */

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
