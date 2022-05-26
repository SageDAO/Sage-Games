import { EarnedPoints } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/prisma/client';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, response: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    response.status(401).end('Not Authenticated');
    return;
  }
  const { address: walletAddress } = session!;
  const { method } = req;
  switch (method) {
    case 'GET':
      await getEarnedPointsAndProof(walletAddress as string, response);
      return;
    default:
      response.status(500).end();
  }
};

async function getEarnedPointsAndProof(walletAddress: string, response: NextApiResponse) {
  const dbPoints: EarnedPoints | null = await prisma.earnedPoints.findUnique({
    where: {
      address: walletAddress,
    },
  });
  response.status(200).json({
    totalPointsEarned: dbPoints ? dbPoints.totalPointsEarned.toString() : '0',
    proof: dbPoints ? dbPoints.proof : '',
    walletAddress,
  });
  response.end();
}

export default handler;
