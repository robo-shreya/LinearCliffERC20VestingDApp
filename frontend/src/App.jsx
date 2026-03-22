import { useState } from "react";
import "./App.css";
import {
  formatTokenAmount,
  getContracts,
  getWalletContext,
  parseTokenAmount,
  requestAccounts,
} from "./contractHelper";

function App() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("not connected");
  const [decimals, setDecimals] = useState(18);
  const [partialClaimAmount, setPartialClaimAmount] = useState("");
  const [owner, setOwner] = useState("-");
  const [beneficiary, setBeneficiary] = useState("-");
  const [funded, setFunded] = useState(false);
  const [totalAllocation, setTotalAllocation] = useState("0");
  const [released, setReleased] = useState("0");
  const [vested, setVested] = useState("0");
  const [claimable, setClaimable] = useState("0");
  const [yourBalance, setYourBalance] = useState("0");
  const [beneficiaryBalance, setBeneficiaryBalance] = useState("0");
  const [vestingBalance, setVestingBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  async function loadBasicVestingState(vesting, tokenDecimals, beneficiaryAddress) {
    setOwner(await vesting.owner());
    setBeneficiary(beneficiaryAddress);
    setFunded(await vesting.funded());
    setTotalAllocation(
      formatTokenAmount(await vesting.totalAllocation(), tokenDecimals)
    );
    setReleased(formatTokenAmount(await vesting.released(), tokenDecimals));
  }

  async function loadTokenState(
    token,
    wallet,
    beneficiaryAddress,
    vestingAddress,
    tokenDecimals
  ) {
    setYourBalance(formatTokenAmount(await token.balanceOf(wallet), tokenDecimals));
    setBeneficiaryBalance(
      formatTokenAmount(await token.balanceOf(beneficiaryAddress), tokenDecimals)
    );
    setVestingBalance(
      formatTokenAmount(await token.balanceOf(vestingAddress), tokenDecimals)
    );
    setAllowance(
      formatTokenAmount(await token.allowance(wallet, vestingAddress), tokenDecimals)
    );
  }

  async function loadClaimState(vesting, tokenDecimals) {
    try {
      setVested(formatTokenAmount(await vesting.getVestedAmount(), tokenDecimals));
      setClaimable(
        formatTokenAmount(await vesting.getClaimableAmount(), tokenDecimals)
      );
    } catch {
      setVested("cliff didn't end yet");
      setClaimable("cliff didn't end yet");
    }
  }

  async function loadVestingContract() {
    const { token, vesting, signer } = await getContracts();
    const wallet = await signer.getAddress();
    const tokenDecimals = Number(await token.decimals());
    const beneficiaryAddress = await vesting.beneficiary();
    const vestingAddress = await vesting.getAddress();

    setDecimals(tokenDecimals);

    await loadBasicVestingState(vesting, tokenDecimals, beneficiaryAddress);
    await loadTokenState(
      token,
      wallet,
      beneficiaryAddress,
      vestingAddress,
      tokenDecimals
    );
    await loadClaimState(vesting, tokenDecimals);
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

  async function runTransaction(
    action,
    pendingMessage,
    submittedMessage,
    successMessage,
    failureMessage
  ) {
    try {
      setStatus(pendingMessage);
      const tx = await action();

      setStatus(submittedMessage);
      await tx.wait();

      await loadVestingContract();
      setStatus(successMessage);
    } catch (error) {
      setStatus(error.message || failureMessage);
    }
  }

  // TODO accept custom amounts to approve
  async function handleApprove() {
    const { token, vesting } = await getContracts();
    const vestingAddress = await vesting.getAddress();
    const allocation = await vesting.totalAllocation();

    await runTransaction(
      () => token.approve(vestingAddress, allocation),
      "waiting for approve confirmation",
      "approve transaction submitted",
      "approve successful",
      "approve failed"
    );
  }

  async function handleFund() {
    const { vesting } = await getContracts();

    await runTransaction(
      () => vesting.fund(),
      "waiting for fund confirmation",
      "fund transaction submitted",
      "fund successful",
      "fund failed"
    );
  }

  // a lot of redundant setup code can be separated 
  // TODO add possibility to manipulate time from UI to test this
  // time manipulation requires a non-metamask based provider
  async function handleClaimAll() {
    const { vesting } = await getContracts();

    await runTransaction(
      () => vesting.claim(),
      "waiting for claim confirmation",
      "claim transaction submitted",
      "claim successful",
      "claim failed"
    );
  }

  async function handlePartialClaim() {
    const { vesting } = await getContracts();
    const amount = parseTokenAmount(partialClaimAmount || "0", decimals);

    await runTransaction(
      () => vesting.partialClaim(amount),
      "waiting for partial claim confirmation",
      "partial claim transaction submitted",
      "partial claim successful",
      "partial claim failed"
    );
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
        <p>your balance: {yourBalance}</p>
        <p>beneficiary balance: {beneficiaryBalance}</p>
        <p>vesting balance: {vestingBalance}</p>
        <p>allowance: {allowance}</p>
      </section>

      <section className="panel">
        <h2>actions</h2>
        <div className="actions">
          <button onClick={handleApprove}>approve</button>
          <button onClick={handleFund}>fund</button>
          <button onClick={handleClaimAll}>claim all</button>
        </div>

        <div className="actions">
          <input
            type="number"
            placeholder="amount"
            value={partialClaimAmount}
            onChange={(event) => setPartialClaimAmount(event.target.value)}
          />
          <button onClick={handlePartialClaim}>partial claim</button>
        </div>
      </section>
    </div>
  );
}

export default App;
