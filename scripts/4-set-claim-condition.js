import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x359Db2D7F8E3ACbCb28fcCbcd5468070E532ac54"
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // specify conditions
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log(
      "✅ Successfully set claim condition on bundle drop:",
      bundleDrop.address
    );
  } catch (error) {
    console.error("🔴 Failed to set claim conditions", error);
  }
})();
