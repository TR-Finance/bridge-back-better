import * as dotenv from 'dotenv';

import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import './tasks/initiateWithdrawal';
import './tasks/runNodeOperator';
import './tasks/delegateEther';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.11',
  networks: {
    rinkeby: {
      url: process.env.ETHEREUM_RINKEBY_PROVIDER_URL || '',
      accounts: process.env.RINKEBY_PRIVATE_KEY !== undefined ? [process.env.RINKEBY_PRIVATE_KEY] : [],
    },
    arbitrumOne: {
      url: process.env.ARBITRUM_ONE_PROVIDER_URL || '',
    },
    arbitrumTestnet: {
      url: process.env.ARBITRUM_RINKEBY_PROVIDER_URL || '',
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumTestnet: process.env.ARBISCAN_API_KEY,
    },
  },
};

export default config;
