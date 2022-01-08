import React from 'react';
import ReactDOM from 'react-dom';

import { ChakraProvider } from '@chakra-ui/react'

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Dapp from './Dapp';

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
          <ChakraProvider resetCSS={true}>
            <Dapp />
          </ChakraProvider>
          <ReactQueryDevtools position={"bottom-right"}/>
      </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
