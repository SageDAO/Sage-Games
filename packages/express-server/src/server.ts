// const express = require("express");
// const dotenv = require("dotenv");
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import Debug from "debug";

dotenv.config();

const debug = Debug("[server]");

const app = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
  res.send("SAGE EXPRESS SERVER");
});

app.listen(port, () => {
  debug(`running at https://localhost:${port}`);
});
