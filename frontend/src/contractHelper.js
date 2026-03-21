import { ethers } from "ethers";
import tokenArtifact from "./abi/MyToken.json";
import vestingArtifact from "./abi/TokenVesting.json";
import {
  HARDHAT_CHAIN_ID,
  MY_TOKEN_ADDRESS,
  TOKEN_VESTING_ADDRESS,
} from "./config";

// AI was used here to assist only in improving the core logic

export async function getWalletContext() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available in this browser.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== HARDHAT_CHAIN_ID) {
    throw new Error("Switch MetaMask to the Hardhat localhost network (chain ID 31337).");
  }

  const signer = await provider.getSigner();

  return { provider, signer };
}

export async function requestAccounts() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available in this browser.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
}

export async function getContracts() {
  const { provider, signer } = await getWalletContext();

  return {
    provider,
    signer,
    token: new ethers.Contract(MY_TOKEN_ADDRESS, tokenArtifact.abi, signer),
    vesting: new ethers.Contract(
      TOKEN_VESTING_ADDRESS,
      vestingArtifact.abi,
      signer,
    ),
  };
}

export function formatTokenAmount(value, decimals = 0) {
  return ethers.formatUnits(value, decimals);
}

export function parseTokenAmount(value, decimals = 0) {
  return ethers.parseUnits(value, decimals);
}
