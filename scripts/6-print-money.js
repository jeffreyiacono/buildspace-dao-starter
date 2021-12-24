import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// this is the address of your ERC-20 contract printed out in the step before
const tokenModule = sdk.getTokenModule(
  "0x6d24E04915a2E24856656a511EdD7C7604f3FD85"
);

(async () => {
  try {
    // what's the max supply you want to set? 1,000,000 is a nice number
    const amount = 1_000_000;
    // We use the util functionn from "ethers" to convert the amount
    // to have 18 decimals (which is the standard for ERC20 tokens).
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // interact with your deployed ERC-20 contract and mint the tokens!
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    // print out how many of your  token's are out there now
    console.log(
      "✅ There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$DINO in circulation"
    );
  } catch (error) {
    console.error("🔴 Failed to print money", error);
  }
})();
