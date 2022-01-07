import { ethers } from 'ethers';
import { useQuery } from 'react-query';

const Withdraw = () => {
    const provider = ethers.getDefaultProvider();
    const { isLoading: ethBalanceLoading, data: ethBalance } = useQuery('ethBalance', async () => {
        const data = await provider.getBalance(this.state.selectedAddress);
        return data;
    });

    if (ethBalanceLoading) {
        return <div>Eth balance loading...</div>;
    }

    return (
        <>
            <div>Withdraw page (will allow user to do a fast withdrawal)</div>
            <div>Eth balance: { ethBalance }</div>
        </>
    );
};

export default Withdraw;
