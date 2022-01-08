// Heavily borrows from: https://github.com/Uniswap/interface/blob/eb09894b736b507b2d707c157a4016c74dfc3468/src/hooks/web3.ts

import { useEffect, useState } from 'react';

import { useQueryClient } from 'react-query';

import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import { injectedConnector } from '../connectors';
import { isMobile } from '../utils/userAgent';
import type { EthereumProvider } from '../lib/ethereum';


/**
 * Tries to connect to an injected connector like MetaMask
 */
export const useEagerConnect = () => {
  const { activate, active } = useWeb3React<Web3Provider>();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!active) {
      injectedConnector.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          activate(injectedConnector, undefined, true).catch(() => {
            setTried(true);
          })
        } else {
          if (isMobile && window.ethereum) {
            activate(injectedConnector, undefined, true).catch(() => {
              setTried(true);
            })
          } else {
            setTried(true);
          }
        }
      });
    }
  }, [activate, active]);

  // Wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active]);

  return tried;
};

/**
 * Reconnects when the chain and account changes
 */
export const useInactiveListener = (suppress = false) => {
  const queryClient = useQueryClient();
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const ethereum = window.ethereum as EthereumProvider | undefined;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      queryClient.invalidateQueries();
      const handleChainChanged = () => {
        activate(injectedConnector, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error);
        })
      };

      const handleAccountsChanged = (accounts: string[]) => {
        queryClient.invalidateQueries();
        if (accounts.length > 0) {
          activate(injectedConnector, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error);
          })
        }
      };

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      }
    }
    return undefined;
  }, [active, error, suppress, activate]);
};
