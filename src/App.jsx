import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

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
  return (
    <div className="landing">
      <Header>
        <div>👀 wallet connected, now what?!</div>
      </Header>
    </div>
  );
};

export default App;

