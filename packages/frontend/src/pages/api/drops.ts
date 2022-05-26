import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/prisma/client"
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query: {id} } = req;


  switch (method) {
		case "GET":
			getDrop(res)
			break;
    default:
      res.status(501).end();
  }
};

function getDrop(res: NextApiResponse): void {

}
