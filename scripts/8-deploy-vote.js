import sdk from "./1-initialize-sdk.js";

// grab the app moudle address
const appModule = sdk.getAppModule(
  "0xA7a20Be51361BF4ee78b00556cbc8e16E1960d31"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Give your governance contract a name
      name: "DinoDAO Proposals",
      // this is the location of your governance token, our ERC-20 contract
      votingTokenAddress: "0x6d24E04915a2E24856656a511EdD7C7604f3FD85",
      // after a proposal is create, when can members start voting?
      // for now, we set this to immediately
      proposalStartWaitTimeInSeconds: 0,
      // how long do members have to vote on a proposal when it's created?
      // we'll set it to 24 hours (86400 seconds)
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      // ...
      votingQuorumFraction: 0,
      // what's the minimum # of tokens a user needs to be allowed to create a
      // proposal?
      // Here we set it to 0, meaning no tokens are required for a user to be
      // allowed to create a proposal
      minimumNumberOfTokensNeededToPropose: "0",
    });
    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address
    );
  } catch (error) {
    console.error("Failed to deploy vote module", error);
  }
})();
