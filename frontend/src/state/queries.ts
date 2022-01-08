import { ethers } from 'ethers';


import { useQuery } from 'react-query';

const provider = ethers.getDefaultProvider();

/**
 * Gets the amount of ether owned by the given address.
 */
export const useEtherBalance = (address: string) => {
    return useQuery(getEtherBalanceQueryKey(address), () => getEtherBalance(address));
};
const getEtherBalanceQueryKey = (address: string) => {
    return ['getEtherBalance', address];
};
const getEtherBalance = async (address: string) => {
    if (!provider) throw new Error('No provider');
    if (!address) throw new Error('No address');
    const data = await provider.getBalance(address);
    return data;
};
