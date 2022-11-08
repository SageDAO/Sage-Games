// const express = require("express");
// const dotenv = require("dotenv");
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import Debug from "debug";
import prisma from "@/prisma/client";

dotenv.config();

const debug = Debug("[server]");

const app = express();
const port = process.env.PORT;

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("REPLY TO GET REQUEST");
});

app.listen(port, () => {
  debug(`running at https://localhost:${port}`);
});
