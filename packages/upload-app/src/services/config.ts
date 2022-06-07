export interface Parameters {
  ENDPOINT_URL: string;
}

export interface Configuration {
  [environment: string]: Parameters;
}

export const targetConfig: Configuration = {
  // IMPORTANT: URLs must end with a forward slash ("/") - or NextJS will redirect, causing CORS errors
  localhost: {
    ENDPOINT_URL: 'http://localhost:3001/api/dropUploadEndpoint/',
  },
  'URN Dev': {
    ENDPOINT_URL: 'https://sage-dev.vercel.app/api/dropUploadEndpoint/',
  },
  'URN Staging': {
    ENDPOINT_URL: 'https://sage-dev.vercel.app/api/dropUploadEndpoint/',
  },
  'URN Production': {
    ENDPOINT_URL: 'https://sage-dev.vercel.app/api/dropUploadEndpoint/',
  },
};
