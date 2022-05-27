import { BigInt } from "@graphprotocol/graph-ts";
import {
  AuctionCancelled,
  AuctionCreated,
  AuctionSettled,
  BidPlaced,
} from "../generated/auction/AuctionContract";
import { Auction, Bid } from "../generated/schema";

export function handleAuctionCreated(event: AuctionCreated): void {
  const auctionId = event.params.auctionId.toHex();
  let auction = new Auction(auctionId);
  auction.status = "Created";
  auction.save();
}

export function handleAuctionSettled(event: AuctionSettled): void {
  const auctionId = event.params.auctionId.toHex();
  let auction = Auction.load(auctionId);
  if (!auction) {
    auction = new Auction(auctionId);
  }
  auction.status = "Settled";
  auction.highestBid = event.params.highestBid;
  auction.highestBidder = event.params.highestBidder;
  auction.save();
}

export function handleAuctionCancelled(event: AuctionCancelled): void {
  const auctionId = event.params.auctionId.toHex();
  let auction = Auction.load(auctionId);
  if (!auction) {
    auction = new Auction(auctionId);
  }
  auction.status = "Cancelled";
  auction.save();
}

export function handleBidPlaced(event: BidPlaced): void {
  const auctionId = event.params.auctionId.toHex();
  let auction = Auction.load(auctionId);
  if (!auction) {
    auction = new Auction(auctionId);
  }
  const bidId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const bid = new Bid(bidId);
  bid.amount = event.params.bidAmount;
  bid.bidder = event.params.bidder;
  bid.endTime = event.params.newEndTime.toI32();
  auction.endTime = bid.endTime;
  bid.auction = auctionId;
  let bids = auction.bids;
  bids.push(bidId);
  auction.bids = bids;
  bid.save();
  auction.save();
}