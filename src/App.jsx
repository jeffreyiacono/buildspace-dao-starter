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

const voteModule = sdk.getVoteModule(
  "0xa759E185aca858C15F3899B593DeD46904502310",
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
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // A fancy function to shorten someones wallet address, no need to show the
  // whole thing
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // retrieve all our existing proposals from the contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // a simple call to voteModule.getAll() to grab the proposals
    voteModule
      .getAll()
      .then((proposals) => {
        // set state
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((error) => {
        console.error("🔴 Failed to get proposals:", error);
      });
  }, [hasClaimedNFT]);

  // we also want to check if the user has already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // if we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet
    if (!proposals.length) {
      return;
    }

    // check if the user has already voted on the first proposal
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log("🥵 user has already voted")
      })
      .catch((error) => {
        console.error("🔴 Failed to check if wallet has voted", error);
      });
  }, [hasClaimedNFT, proposals, address]);

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

  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

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
        <h1>🦖Welcome to DinoDAO</h1>
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
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
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

