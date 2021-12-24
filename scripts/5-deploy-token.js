import sdk from "./1-initialize-sdk.js";

// in order to deploy the new contract we need our hold friend the app module
// again
const app = sdk.getAppModule("0xA7a20Be51361BF4ee78b00556cbc8e16E1960d31");

(async () => {
  try {
    // deploy a standard ERC-20 contact
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. Ethereum
      name: "DinoDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "DINO",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("🔴 Failed to deploy token module", error);
  }
})();
