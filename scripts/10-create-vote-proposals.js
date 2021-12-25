import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// our voting contract
const voteModule = sdk.getVoteModule(
  "0xa759E185aca858C15F3899B593DeD46904502310"
);

// our ERC-20 contract
const tokenModule = sdk.getTokenModule(
  "0x6d24e04915a2e24856656a511edd7c7604f3fd85"
);

(async () => {
  try {
    const amount = 420_000;
    // create proposal to mint 420,000  new token to the treasury
    await voteModule.propose(
      "Should the DAO mint an additional " +
        amount +
        " tokens into the treasury?",
      [
        {
          // Our nativeTOken is ETH. nativeTokenValue is the amount of ETH we
          // want to send in this proposal. In this case, we're sending 0 ETH.
          // We're just minting new tokens to the treasury. So, set it to 0.
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // we're doing a mint! And, we're minting to the voteModule, which
            // is acting as our treasury
            "mint",
            [voteModule.address, ethers.utils.parseUnits(amount.toString(), 18)]
          ),
          // our token module that actually executes the mint
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("🔴 Failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    // create proposal to transfer 6,900 tokens for being awesome
    await voteModule.propose(
      "Should the DAO transfer " +
        amount +
        " tokens from the treasury to " +
        process.env.WALLET_ADDRESS +
        " for being awesome?",
      [
        {
          // Again, we're sending ourselves 0 ETH. Just sending our own token
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            // we're doing a transfer from the treasury to our wallet
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("🔴 Failed to create second proposal", error);
  }
})();
