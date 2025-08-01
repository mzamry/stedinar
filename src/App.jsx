import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { CONTRACT_ADDRESS } from "./config";
import abi from "./abi/FlexibleStaking.json";
import eDinarLogo from "./assets/eDinarR1.png";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [stakingAmount, setStakingAmount] = useState("");
  const [userInfo, setUserInfo] = useState({ staked: 0, pendingRewards: 0 });

  useEffect(() => {
    if (contract && walletAddress) {
      fetchUserInfo();
      const interval = setInterval(fetchUserInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [contract, walletAddress]);

  const fetchUserInfo = async () => {
    try {
      const [staked, rewards] = await contract.userInfo(walletAddress);
      setUserInfo({
        staked: ethers.utils.formatEther(staked),
        pendingRewards: ethers.utils.formatEther(rewards),
      });
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

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

  const handleStake = async () => {
    if (!contract || !stakingAmount) return;
    try {
      const tx = await contract.stake(ethers.utils.parseEther(stakingAmount));
      await tx.wait();
      setStakingAmount("");
      fetchUserInfo();
      alert("✅ Staking successful!");
    } catch (err) {
      console.error("Staking failed:", err);
      alert("❌ Staking failed!");
    }
  };

  const handleUnstake = async () => {
    if (!contract || !stakingAmount) return;
    try {
      const tx = await contract.unstake(ethers.utils.parseEther(stakingAmount));
      await tx.wait();
      setStakingAmount("");
      fetchUserInfo();
      alert("✅ Unstake successful!");
    } catch (err) {
      console.error("Unstake failed:", err);
      alert("❌ Unstake failed!");
    }
  };

  const handleClaim = async () => {
    if (!contract) return;
    try {
      const tx = await contract.claimRewards();
      await tx.wait();
      fetchUserInfo();
      alert("🎉 Rewards claimed!");
    } catch (err) {
      console.error("Claim failed:", err);
      alert("❌ Claim failed!");
    }
  };

  return (
    <div className="app">
      <img src={eDinarLogo} alt="eDinar Logo" className="logo" />
      <h1>eDINAR Flexible Staking</h1>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p><strong>Connected:</strong> {walletAddress}</p>
      )}

      <div className="card">
        <input
          type="text"
          placeholder="Amount (e.g. 1)"
          value={stakingAmount}
          onChange={(e) => setStakingAmount(e.target.value)}
        />
        <div className="button-group">
          <button onClick={handleStake} disabled={!walletAddress}>Stake</button>
          <button onClick={handleUnstake} disabled={!walletAddress}>Unstake</button>
          <button onClick={handleClaim} disabled={!walletAddress}>Claim Rewards</button>
        </div>

        <div className="info">
          <p><strong>Staked:</strong> {userInfo.staked} EDINAR</p>
          <p><strong>Live Rewards:</strong> {userInfo.pendingRewards} EDINAR</p>
        </div>
      </div>
    </div>
  );
}

export default App;
