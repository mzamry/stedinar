import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { CONTRACT_ADDRESS } from "./config";
import abi from "./abi/FlexibleStaking.json";
import eDinarLogo from "./assets/eDinarR1.png"; // Ensure this file exists in /src/assets/

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [stakingAmount, setStakingAmount] = useState("");

  // Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const stakingContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
        setContract(stakingContract);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask.");
    }
  };

  // Stake tokens
  const handleStake = async () => {
    if (!contract || !stakingAmount) return;
    try {
      const tx = await contract.stake(ethers.utils.parseEther(stakingAmount));
      await tx.wait();
      alert("✅ Staking successful!");
      setStakingAmount("");
    } catch (err) {
      console.error("Staking failed:", err);
      alert("❌ Staking failed.");
    }
  };

  return (
    <div className="app">
      <img src={eDinarLogo} alt="eDinar Logo" className="logo" />
      <h1>Flexible Staking dApp</h1>

      {walletAddress ? (
        <p>🔗 Connected wallet: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      <div className="card">
        <input
          type="text"
          placeholder="Amount to stake (e.g. 1)"
          value={stakingAmount}
          onChange={(e) => setStakingAmount(e.target.value)}
        />
        <button onClick={handleStake} disabled={!walletAddress}>
          Stake Tokens
        </button>
      </div>
    </div>
  );
}

export default App;
