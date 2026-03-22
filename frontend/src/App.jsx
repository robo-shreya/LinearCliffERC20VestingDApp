import { useState } from "react";
import "./App.css";
import {
  getContracts,
  getWalletContext,
  requestAccounts,
} from "./contractHelper";

function App() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("not connected");
  const [owner, setOwner] = useState("-");
  const [beneficiary, setBeneficiary] = useState("-");
  const [funded, setFunded] = useState(false);
  const [totalAllocation, setTotalAllocation] = useState("0");
  const [released, setReleased] = useState("0");
  const [vested, setVested] = useState("0");
  const [claimable, setClaimable] = useState("0");

  async function loadVestingContract() {
    const { vesting } = await getContracts();

    setOwner(await vesting.owner());
    setBeneficiary(await vesting.beneficiary());
    setFunded(await vesting.funded());
    setTotalAllocation((await vesting.totalAllocation()).toString());
    setReleased((await vesting.released()).toString());

    // to show default 0 value before cliff ends 
    try {
      setVested((await vesting.getVestedAmount()).toString());
      setClaimable((await vesting.getClaimableAmount()).toString());
    } catch {
      setVested("cliff didn't end yet");
      setClaimable("cliff didn't end yet");
    }
  }

  async function handleConnectWallet() {
    try {
      // asks MetaMask for permission
      await requestAccounts();

      // gets the signer
      const { signer } = await getWalletContext();

      // gives the connected wallet address
      const wallet = await signer.getAddress();
      setAccount(wallet);
      await loadVestingContract();
      setStatus(wallet ? "connected" : "not connected");
    } catch (error) {
      setStatus(error.message || "connection failed");
    }
  }

  return (
    <div className="app">
      <h1>vesting skeleton frontend</h1>

      <section className="panel">
        <div className="row">
          <button onClick={handleConnectWallet}>connect wallet</button>
          <span className="status">{status}</span>
        </div>
        <p>account: {account || "-"}</p>
        <p>token: -</p>
        <p>vesting: -</p>
      </section>

      <section className="panel">
        <h2>state</h2>
        <p>owner: {owner}</p>
        <p>beneficiary: {beneficiary}</p>
        <p>funded: {String(funded)}</p>
        <p>allocation: {totalAllocation}</p>
        <p>vested: {vested}</p>
        <p>claimable: {claimable}</p>
        <p>released: {released}</p>
        <p>your balance: 0</p>
        <p>beneficiary balance: 0</p>
        <p>vesting balance: 0</p>
        <p>allowance: 0</p>
      </section>

      <section className="panel">
        <h2>actions</h2>
        <div className="actions">
          <button>approve</button>
          <button>fund</button>
          <button>claim all</button>
        </div>

        <div className="actions">
          <input type="number" placeholder="amount" />
          <button>partial claim</button>
        </div>
      </section>
    </div>
  );
}

export default App;
