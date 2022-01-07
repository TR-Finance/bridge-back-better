import React from 'react';
import ReactDOM from 'react-dom';

import { MetaMaskInpageProvider } from '@metamask/providers';

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Dapp from './Dapp';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Dapp />
      <ReactQueryDevtools position={"bottom-right"}/>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}
