import {useEffect, useState} from "react";
import { ethers } from "ethers";

const ConnectWallet = () => {
    const [currentAccount, setCurrentAccount] = useState();
    //const contractAddress = ""; // Must hardcode contract address after deploying using hardhat
    //const contractABI = abi.abi; // Get contract abi from node_artifacts

    const connectWallet = async () => {
        try {

            // Creates an ethereum object that allows request users' Ethereum accounts,
            // read data from blockchains the user is connected to,
            // and suggest that the user sign messages and transactions.
            const {ethereum} = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            // This method checks if the website is permitted to access the user's metamask wallet
            const accounts = await ethereum.request({method: 'eth_accounts'});

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found")
            }
        } catch (error) {
            console.log(error);
        }
 /*       // This method is run when the user clicks the Connect. It connects the
        // dapp to the user's wallet, and initializes it.
    
        // To connect to the user's wallet, we have to run this method.
        // It returns a promise that will resolve to the user's address.
        const [selectedAddress] = await window.ethereum.enable();

    
        // Once we have the address, we can initialize the application.
    
        // First we check the network
        if (!this._checkNetwork()) {
          return;
        }
    
        this._initialize(selectedAddress);
    
        // We reinitialize it whenever the user changes their account.
        window.ethereum.on("accountsChanged", ([newAddress]) => {
          this._stopPollingData();
          // `accountsChanged` event can be triggered with an undefined newAddress.
          // This happens when the user removes the Dapp from the "Connected
          // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
          // To avoid errors, we reset the dapp state 
          if (newAddress === undefined) {
            return this._resetState();
          }
          
          this._initialize(newAddress);
        });
        
        // We reset the dapp state if the network is changed
        window.ethereum.on("networkChanged", ([networkId]) => {
          this._stopPollingData();
          this._resetState();

        });
        */
    };

    const checkIfWalletIsConnected = async () => {
        try {
          const {ethereum} = window;

          if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
          } else {
            console.log("We have the ethereum object", ethereum);
          }

          const accounts = await ethereum.request({method: 'eth_accounts'});
          if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
          } else {
            console.log("No authorized account found")
          }
        } catch (error) {
          console.log(error);
        }
  }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])

    return (
        <>
            <button onClick={connectWallet}>Connect Wallet</button>
        </>
    );
};

export default ConnectWallet;
