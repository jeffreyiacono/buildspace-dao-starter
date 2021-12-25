import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// this is the address to our ERC-1155 membership NFT contract
const bundleDropModule = sdk.getBundleDropModule(
  "0x359db2d7f8e3acbcb28fccbcd5468070e532ac54"
);

// this is the address to your ERC-20 token contract
const tokenModule = sdk.getTokenModule(
  "0x6d24E04915a2E24856656a511EdD7C7604f3FD85"
);

(async () => {
  try {
    // grab  all the addresses of people who  own your membership NFT, which has
    // a tokenID of 0
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log(
        "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!"
      );
      process.ext(0);
    }

    const airdropTargets = walletAddresses.map((address) => {
      // pick a random # between 1_000 and 10_000
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // set up target
      const airdropTarget = {
        address,
        // Remember, we need 18 decimal places!
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });

    // call transferBatch onn all our airdrop targets
    console.log("🛫 Starting airdrop ...");
    await tokenModule.transferBatch(airdropTargets);
    console.log(
      "✅ Successfully airdropped tokens to all the holders of the NFT"
    );
  } catch (error) {
    console.error("🔴 Failed to airdrop tokens", error);
  }
})();
