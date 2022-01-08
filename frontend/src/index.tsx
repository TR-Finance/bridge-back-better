import React from 'react';
import ReactDOM from 'react-dom';

import { ChakraProvider } from '@chakra-ui/react'

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import Dapp from './Dapp';

const queryClient = new QueryClient();

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
};

ReactDOM.render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <ChakraProvider resetCSS={true}>
            <Dapp />
          </ChakraProvider>
          <ReactQueryDevtools position={"bottom-right"}/>
        </Web3ReactProvider>
      </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
