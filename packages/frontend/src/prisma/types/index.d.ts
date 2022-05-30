import { Prisma, Drop, User } from '@prisma/client';
import type { DropWhereInput } from '@prisma/client';

export type { User, Drop };

export type SafeUserUpdate = Partial<
  Pick<User, 'displayName' | 'username' | 'email' | 'bio' | 'profilePicture'>
>;

export type DropWithArtist = Prisma.DropGetPayload<{
  include: {
    Artist: true;
  };
}>;

export type DropWithGamesAndArtist = Prisma.DropGetPayload<{
  include: {
    Lotteries: {
      include: {
        Nfts: true;
      };
    };
    Auctions: {
      include: {
        Nft: true;
      };
    };
    Artist: true;
  };
}>;

export type Game = Auction_include_Nft | Lottery_include_Nft;

export type Auction_include_Nft = Prisma.AuctionGetPayload<{
  include: { Nft: true };
}>;

export type Auction_include_DropNftArtist = Prisma.AuctionGetPayload<{
  include: {
    Nft: true;
    Drop: {
      include: {
        Artist: true;
      };
    };
  };
}>;

export type AuctionNftWithArtist = Prisma.AuctionGetPayload<{
  include: {
    Nft: true;
    Drop: {
      include: {
        Artist: true;
      };
    };
  };
}>;

export type Lottery_include_Nft = Prisma.LotteryGetPayload<{
  include: { Nfts: true };
}>;

export type LotteryWithNftsAndArtist = Prisma.LotteryGetPayload<{
  include: {
    Nfts: true;
    Drop: {
      include: {
        Artist: true;
      };
    };
  };
}>;

export interface GamePrize {
  nftId: number;
  dropId: number;
  auctionId?: number;
  lotteryId?: number;
  lotteryTicketNumber?: number;
  lotteryProof?: string;
  nftName: string;
  artistUsername: string;
  artistDisplayName: string;
  artistProfilePicture: string;
  s3Path: string;
  isVideo: boolean;
  claimedAt?: Date;
}
