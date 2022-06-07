import { gql, useQuery } from '@apollo/client';

const LOTTERIES_QUERY = gql`
  query GetLotteries {
    lotteries(first: 5) {
      id
      status
      tickets {
        id
      }
      claimedPrizes {
        id
      }
    }
    tickets(first: 5) {
      id
      lottery {
        id
      }
      ticketNumber
      address
    }
  }
`;

export function GamePanel() {
  const { loading, error, data } = useQuery(LOTTERIES_QUERY);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  return data.lotteries.map(({ id, status }) => (
    <div key={id}>
      <p>
        {id}: {status}
      </p>
    </div>
  ));
}