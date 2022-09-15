export interface Parameters {
  ENDPOINT_URL: string;
}

export interface Configuration {
  [environment: string]: Parameters;
}

export const targetConfig: Configuration = {
  // IMPORTANT: URLs must end with a forward slash ("/") - or NextJS will redirect, causing CORS errors
  'localhost': {
    ENDPOINT_URL: 'http://localhost:3001/api/dropUploadEndpoint/',
  },
  'SAGE Dev': {
    ENDPOINT_URL: 'https://sage-dev.vercel.app/api/dropUploadEndpoint/',
  },
  'SAGE Staging': {
    ENDPOINT_URL: 'https://sage-staging.vercel.app/api/dropUploadEndpoint/',
  },
  'SAGE Production': {
    ENDPOINT_URL: 'https://sage-dev.vercel.app/api/dropUploadEndpoint/',
  },
};
