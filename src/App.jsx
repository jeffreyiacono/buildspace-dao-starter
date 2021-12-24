import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// we instatiate the sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// we grab a reference to our ERC-1155 membership contract
const bundleDropModule = sdk.getBundleDropModule(
  "0x359Db2D7F8E3ACbCb28fcCbcd5468070E532ac54",
);

// we grab a reference to our ERC-20 governance token
const tokenModule = sdk.getTokenModule(
  "0x6d24E04915a2E24856656a511EdD7C7604f3FD85",
);

const Header = () => {
  return (
    <div className="headerContent">
      <h1>🦖Welcome to DinoDAO</h1>
      <div className="tagLine">
        DAO to purchase dinosaur fossils ... or start an IRL Jurassic Park.
      </div>
    </div>
  );
}

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  // The signer is required to sign transactions on the blockchain
  // without it we can only read data, not write
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // the array holding all our members' addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the
  // whole thing
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // another useEffect!
  useEffect(() => {
    // we pass the signer to the sdk, which enables us to interact with our
    // deployed conntract
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  // This useEffect grabs all the addresses of our members holding our NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // just like we did in the 7-airdrop-token.js file! Grab the users who hold
    // our NFT with tokenId 0
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("🚀 Members addresses", addresses);
        setMemberAddresses(addresses);
      })
      .catch((error) => {
        console.error("🔴 Failed to get member list", error);
      });
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of token each member holds
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("💰 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((error) => {
        console.error("🔴 Failed to get token amounts", error);
      });
  }, [hasClaimedNFT]);

  // Now we combine the memberAddresses and memberTokenAmounts into a single
  // array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // if they don't have a connected wallet, exit!
    if (!address) {
      return;
    }

    // check if user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // if balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 User holds the membership NFT");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 User does NOT have a membership NFT");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("🔴 Failed to get NFT balance", error);
      });
  }, [address]);

  // this is the case where the user can't connect their wallet
  // to your web app. Let them call connectWallet
  if (!address) {
    return (
      <div className="landing">
        <Header />
        <button 
          onClick={() => connectWallet("injected")} 
          className="btn-hero"
        >
          Connect your wallet
        </button>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🦖 DinoDAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const mintNft = () => {
    setIsClaiming(true);
    // call bunndleDropModule.claim("0", 1) to mint nnft to user's wallet
    bundleDropModule
      .claim("0", 1)
      .catch((err) => {
        console.error("🔴 Failed to claim", err);
        setIsClaiming(false);
      })
      .finally(() => {
        // stop loading state
        setIsClaiming(false);
        // set claim state
        setHasClaimedNFT(true);
        // show user their fancy new NFT
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0"`
        );
      });
  }

  // render mint NFT screen
  return (
    <div className="landing">
      <Header />
      <h2>Mint your free DAO Membership NFT</h2>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting ..." : "Mint your NFT (FREE)"}
      </button>
    </div>
  );
};

export default App;

