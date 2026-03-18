import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

// this test has been written with extensive AI help

describe("TokenVesting", function () {
    let owner, beneficiary, other;
    let token, vesting;
    const supply = 1000n;
    const allocation = 300n;
    const cliff = 60n;
    const duration = 300n;
    let start;

    beforeEach(async function () {
        [owner, beneficiary, other] = await ethers.getSigners();

        const MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(supply, "MyToken", "MTK", 18);
        await token.waitForDeployment();

        const latestBlock = await ethers.provider.getBlock("latest");
        start = BigInt(latestBlock.timestamp) + 10n;

        const TokenVesting = await ethers.getContractFactory("TokenVesting");
        vesting = await TokenVesting.deploy(
            beneficiary.address,
            await token.getAddress(),
            start,
            duration,
            cliff,
            allocation
        );
        await vesting.waitForDeployment();

        await token.approve(await vesting.getAddress(), allocation);
    });

    async function increaseTimeTo(timestamp) {
        await ethers.provider.send("evm_setNextBlockTimestamp", [Number(timestamp)]);
        await ethers.provider.send("evm_mine", []);
    }

    it("sets constructor values correctly", async function () {
        expect(await vesting.beneficiary()).to.equal(beneficiary.address);
        expect(await vesting.totalAllocation()).to.equal(allocation);
        expect(await vesting.owner()).to.equal(owner.address);
    });

    it("funds the vesting contract", async function () {
        await vesting.fund();
        expect(await token.balanceOf(await vesting.getAddress())).to.equal(allocation);
        expect(await vesting.funded()).to.equal(true);
    });

    it("prevents non-owner from funding", async function () {
        await expect(vesting.connect(other).fund()).to.be.revertedWith(
            "user is not the owner, action not permitted"
        );
    });

    it("prevents claim before cliff", async function () {
        await vesting.fund();
        await expect(vesting.connect(beneficiary).claim()).to.be.revertedWith(
            "wait for the cliff period to end"
        );
    });

    it("allows a partial claim after the cliff", async function () {
        await vesting.fund();
        await increaseTimeTo(start + cliff + 30n);

        const claimable = await vesting.getClaimableAmount();
        expect(claimable).to.be.greaterThan(0);

        await vesting.connect(beneficiary).partialClaim(40);

        expect(await token.balanceOf(beneficiary.address)).to.equal(40);
        expect(await vesting.released()).to.equal(40);
        expect(await vesting.getClaimableAmount()).to.be.greaterThanOrEqual(
            claimable - 40n
        );
    });

    it("releases the full allocation after vesting ends", async function () {
        await vesting.fund();
        await increaseTimeTo(start + duration + 1n);

        await vesting.connect(beneficiary).claim();

        expect(await token.balanceOf(beneficiary.address)).to.equal(allocation);
        expect(await vesting.released()).to.equal(allocation);
        expect(await vesting.getClaimableAmount()).to.equal(0);
    });
});
