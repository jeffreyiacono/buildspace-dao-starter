import { ThirdwebSDK } from "@3rdweb/sdk";
import ethers from "ethers";

// importing and configuring our .env file that we use the securely store our
// environment
import dotenv from "dotenv";
dotenv.config();

// some quick checks to make sure our .env is working
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
  console.log("🛑 Private key not found.");
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === "") {
  console.log("🛑 Alchemy API URL key not found.");
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === "") {
  console.log("🛑 Wallet Address key not found.");
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    // Your wallet private key, always keep private, do not share
    process.env.PRIVATE_KEY,
    // RPC URL, we'll use our Alchemy API URL from .env
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL)
  )
);

(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("Your add address is:", apps[0].address);
  } catch (err) {
    console.error("Failed to get apps from the sdk", err);
    process.exit(1);
  }
})();

export default sdk;
