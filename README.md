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

2. Copy `.env.example` into `.env` and replace the variables with your own API keys and private keys:  
`ETHEREUM_RINKEBY_PROVIDER_URL`: JSON-RPC endpoint for Rinkeby on Ethereum  
`ARBITRUM_RINKEBY_PROVIDER_URL`: JSON-RPC endpoint for Rinkeby on Arbitrum  
`RINKEBY_PRIVATE_KEY`: Private key of a wallet you want to use on Rinkeby  

3. Deploy the contracts to Rinkeby on Ethereum:
```sh
npx hardhat run scripts/deploy.ts --network rinkeby
```

4. Add the Arbitrum Rinkeby network to MetaMask so you can see your funds there. See [here](https://developer.offchainlabs.com/docs/public_testnet) for the values to enter.

### Test the Fast Withdrawal
1. Using the same wallet you used for the `RINKEBY_PRIVATE_KEY` environment variable, bridge some testnet ETH to Arbitrum.

2. Run our Hardhat task to perform the fast withdrawal:
```sh
npx hardhat fastWithdrawal --amount 0.0000001 --network rinkeby
```
