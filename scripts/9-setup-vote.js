import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// this is our governance contract
const voteModule = sdk.getVoteModule(
  "0xa759E185aca858C15F3899B593DeD46904502310"
);

// this is our ERC-20 contract
const tokenModule = sdk.getTokenModule(
  "0x6d24E04915a2E24856656a511EdD7C7604f3FD85"
);

(async () => {
  try {
    // give our treasury the power to mint additional token if needed
    await tokenModule.grantRole("minter", voteModule.address);
    console.log(
      "✅ Successfully gave vote module permission to act on token module"
    );
  } catch (error) {
    console.error(
      "🔴 Failed to grant vote module permissions to token module",
      error
    );
    process.exit(1);
  }

  try {
    // grab our wallets token balance, remember -- we hold basically the entire
    // supply
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // grab 90% of the supply that we hold
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // transfer 90% of the supply to our voting contract
    await tokenModule.transfer(voteModule.address, percent90);

    console.log("✅ Successfully transferred tokens to vote module");
  } catch (error) {
    console.error("🔴 Failed to transfer tokens to vote module", error);
  }
})();
