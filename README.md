# BridgeBackBetter
Smart contracts and frontend for [fast withdrawals](https://developer.offchainlabs.com/docs/withdrawals) from optimstic rollups to Ethereum. Initially targeting Arbitrum.

## Developer Quick Start (Local Build)
1. Clone the repo and install dependencies:
```sh
git clone git@github.com:TR-Finance/BridgeBackBetter.git
cd BridgeBackBetter
npm install
```

2. Run Hardhat's test net:
```sh
npx hardhat node
```

3. In a new terminal window, navigate to this repo's root folder and deploy the contracts to the local test net you just started:
```sh
npx hardhat run scripts/deploy.ts --network localhost
```
NOTE: This won't work because the deploy script is now hardcoded for rinkeby.

4. Run the frontend after installing its dependencies:
```sh
cd frontend
npm install
npm start
```

5. Open [http://localhost:3000/](http://localhost:3000/) to see the frontend. You will
need to set Metamask to use the network for `Localhost 8545`.

## Developer Guide (Rinkeby)
### One-time Setup
1. Clone the repo and install dependencies:
```sh
git clone git@github.com:TR-Finance/BridgeBackBetter.git
cd BridgeBackBetter
npm install
```

2. Copy `.env.example` into `.env` and replace the variables with your own API keys and private keys
(make accounts at [Alchemy](https://alchemyapi.io/) and [Etherscan](https://etherscan.io)):  
`ETHEREUM_RINKEBY_PROVIDER_URL`: JSON-RPC endpoint for Rinkeby on Ethereum  
`ARBITRUM_RINKEBY_PROVIDER_URL`: JSON-RPC endpoint for Rinkeby on Arbitrum  
`RINKEBY_PRIVATE_KEY`: Private key of a wallet you want to use on Rinkeby  
`ETHERSCAN_API_KEY`:  API key from Etherscan to verify smart contract sources

3. Deploy the contracts to the testnet for Ethereum and Arbitrum, and verify their sources on Etherscan and Arbiscan so you can debug them more easily:
```sh
npx hardhat run scripts/deployEthereum.ts --network rinkeby
npx hardhat run scripts/deployArbitrum.ts --network arbitrumTestnet
npx hardhat verify --network rinkeby <ADDRESS OF BridgeBackBetterV1> "100000000000000000" "100000000000000000"
npx hardhat verify --network rinkeby <ADDRESS OF BBBEthPoolV1> "<ADDRESS OF BridgeBackBetterV1>"
npx hardhat verify --network arbitrumTestnet <ADDRESS of ArbitrumWithdrawalV1>
```

4. Add the Arbitrum Rinkeby network to MetaMask so you can see your funds there. See [here](https://developer.offchainlabs.com/docs/public_testnet) for the values to enter.

### Test the Fast Withdrawal
1. Using the same wallet you used for the `RINKEBY_PRIVATE_KEY` environment variable, bridge some testnet ETH to Arbitrum
at [https://bridge.arbitrum.io](https://bridge.arbitrum.io)

2. Provide liquidity to the pool that fronts the funds for fast withdrawals:
```sh
npx hardhat run stake --amount 0.0000005 --network rinkeby
```

3. Run the node operator script that will listen for withdrawals on Arbitrum and tell the contract on Ethereum to front the funds:
```sh
npx hardhat run nodeOperator --bondAmount 0.0000003 --network rinkeby
```

4. Leave the node operator script running and, in a separate terminal, run our Hardhat task to perform the fast withdrawal:
```sh
npx hardhat fastWithdrawal --amount 0.0000001 --network arbitrumTestnet
```
