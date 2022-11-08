import prisma from "../prisma/client";
import express, { Express, Request, Response } from "express";

const leaderboardRouter = express.Router();

leaderboardRouter.get("/", async (_req, res) => {
  try {
    res.status(501).send("leaderboard work in progress");
    //TODO: synthesize top artist data
    // res.status(200).send("leaderboard (not yet implemented)");
  } catch (error) {
    res.status(500).send();
  }
});

leaderboardRouter.get("/artist", async (req, res, next) => {
  const { id } = req.query;
  try {
    if (!id) {
      res.status(400).send("no wallet id provided");
    }
    //where walletAddress is among this artist's wallet
    const artist = await prisma.artist.findFirst({
      where: { id: Number(id) },
    });
    //TODO: synthesize single artist data
    if (!artist) {
      res.status(404).send("no artist found");
    }
    res.status(200).send(artist);
  } catch (error) {
    if (error) {
      res.status(500).send();
    }
  }
});

export default leaderboardRouter;
