# BridgeBackBetter

Smart contracts for [fast withdrawals](https://developer.offchainlabs.com/docs/withdrawals) from optimstic rollups to Ethereum. Arbitrum support is fully functional on Rinkeby.

| Contract                 | Address | Network          |
| ------------------------ | ------- | ---------------- |
| BridgeBackBetterV1.sol   | TODO    | Ethereum Rinkeby |
| ArbitrumWithdrawalV1.sol | TODO    | Arbitrum Rinkeby |

## Protocol Basics

There are 2 contracts -- 1 on Ethereum and 1 on Arbitrum:

1. Ethereum: The main contract that handles providing liquidity and interactions with node operators.
2. Arbitrum: The withdrawal contract that receives ETH from users on Arbitrum and emits an event for node operators to listen to.

### High Level Typical Flow

1. Node operator bonds ETH and runs their off-chain script to listen for `WithdrawalInitiated` events on Arbitrum.
2. Liquidity provider delegates ETH to a node operator of their choice.
3. User calls `withdraw()` on the Arbitrum withdrawal contract, which starts the 7-day withdrawal from Arbitrum to Ethereum and emits an event.
4. Node operator hears this event, runs off-chain logic to determine if this withdrawal is valid, and calls `verifyWithdrawal()` on the main Ethereum contract if it determines it is valid.
5. Main contract sends ETH from the node operator's delegators to the user's wallet on Ethereum and gives the node operator and stakers (liquidity providers) a small fee.
6. The withdrawer's ETH from Arbitrum arrives to the main contract after 7 days (node operator initiates transaction to claim it).
7. If the withdrawal doesn't go through to Ethereum (i.e., it gets challenged), the node operator who incorrectly validated the withdrawal gets their bond slashed. Stakers who delegated to that node operator cover any remaining losses if the bond wasn't high enough to cover the full withdrawal amount.

### Security Note

You should only delegate to node operators you trust. If a node operator has more ETH delegated than bonded, then they can steal the difference by validating a fake or non-existent withdrawal. For example, if a node operator bonds 1 ETH and has 2 ETH delegated to them, they can validate a withdrawal for 2 ETH to their own wallet and will only be slashed by 1 ETH (their bonded amount) when that fake withdrawal eventually fails to be repaid.

### Miscellaneous Notes

- Node operators bonding ETH has a 7-day cooldown (time when you can't unbond).
- Stakers delegating ETH to a node operator also have a 7-day cooldown (time when you can't undelegate).
- Accounting happens when withdrawing from the pool -- a counter of fees is incremented for the node operator that verifies a withdrawal, and the delegators for that pool get a portion of that fee when they undelegate. Since it's not a direct, tiny fee for each delegator, delegators are incentivized to withdraw after their 7-day cooldown and redelegate again (depending on if the portion of their fees accumulated during those 7 days is greater than the gas fee for the undelegate transaction).)

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
   `ETHERSCAN_API_KEY`: API key from Etherscan to verify smart contract sources

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
