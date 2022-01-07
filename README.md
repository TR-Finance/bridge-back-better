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

4. Run the frontend after installing its dependencies:
```sh
cd frontend
npm install
npm start
```
> Note: There's [an issue in `ganache-core`](https://github.com/trufflesuite/ganache-core/issues/650) that can make the `npm install` step fail. 
>
> If you see `npm ERR! code ENOLOCAL`, try running `npm ci` instead of `npm install`.

5. Open [http://localhost:3000/](http://localhost:3000/) to see the frontend. You will
need to set Metamask to use the network for `Localhost 8545`.

## Troubleshooting

- `Invalid nonce` errors: if you are seeing this error on the `npx hardhat node`
  console, try resetting your Metamask account. This will reset the account's
  transaction history and also the nonce. Open Metamask, click on your account
  followed by `Settings > Advanced > Reset Account`.
