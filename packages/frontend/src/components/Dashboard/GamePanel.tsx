import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

export function GamePanel() {
  const client = new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/28124/urndrops/v0.0.10',
    cache: new InMemoryCache(),
  });
  return <></>;
}
