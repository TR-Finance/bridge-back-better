import { useQuery } from 'react-query';
import { getProvider } from '../connectors';

/**
 * Gets the amount of ether owned by the given address.
 */
export const useEtherBalance = (chainId: number, address: string) => {
  return useQuery(getEtherBalanceQueryKey(chainId, address), () => getEtherBalance(chainId, address));
};
const getEtherBalanceQueryKey = (chainId: number, address: string) => {
  return ['getEtherBalance', chainId, address];
};
const getEtherBalance = async (chainId: number, address: string) => {
  const provider = getProvider(chainId);
  if (!address) throw new Error('No address on chainId: ' + chainId);
  const data = await provider.getBalance(address);
  return data;
};
