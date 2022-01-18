export interface EthereumProvider {
  on?: (...args: any[]) => void;
  removeListener?: (...args: any[]) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
