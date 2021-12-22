import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x359Db2D7F8E3ACbCb28fcCbcd5468070E532ac54"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "T-Rex",
        description: "This NFT gives you access to DinoDAO",
        image: readFileSync("scripts/assets/dino-badge.png"),
      },
    ]);
    console.log("✅ Successfully create a new NFT in the drop!");
  } catch (error) {
    console.error("🔴 Failed to create the new NFT", error);
  }
})();
