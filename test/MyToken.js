import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("MyToken", function () {
    let owner;
    let addr1;
    let addr2;
    let token;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        token = await ethers.deployContract("MyToken", [1000, "MyToken", "MTK", 18]);
        await token.waitForDeployment();
    });

    it("sets totalSupply, name, symbol, and decimals correctly", async function () {
        expect(await token.totalSupply()).to.equal(1000);
        expect(await token.name()).to.equal("MyToken");
        expect(await token.symbol()).to.equal("MTK");
        expect(await token.decimals()).to.equal(18);
    });

    it("assigns the initial supply to the deployer", async function () {
        expect(await token.balanceOf(owner.address)).to.equal(1000);
        expect(await token.balanceOf(addr1.address)).to.equal(0);
    });

    it("approves allowance correctly", async function () {
        await token.approve(addr1.address, 100);
        expect(await token.allowance(owner.address, addr1.address)).to.equal(100);
    });

    it("transfers tokens between accounts", async function () {
        await token.transfer(addr1.address, 250);

        expect(await token.balanceOf(owner.address)).to.equal(750);
        expect(await token.balanceOf(addr1.address)).to.equal(250);
    });

    it("reverts transfer if sender has no balance", async function () {
        await expect(
            token.connect(addr1).transfer(addr2.address, 10)
        ).to.be.revertedWithPanic();
    });

    it("reverts transferFrom if no allowance is set", async function () {
        await expect(
            token.connect(addr1).transferFrom(owner.address, addr2.address, 10)
        ).to.be.revertedWithPanic();
    });

    it("transferFrom moves tokens when allowance exists", async function () {
        await token.approve(addr1.address, 80);
        await token.connect(addr1).transferFrom(owner.address, addr2.address, 50);

        expect(await token.balanceOf(addr2.address)).to.equal(50);
        expect(await token.balanceOf(owner.address)).to.equal(950);
        expect(await token.allowance(owner.address, addr1.address)).to.equal(30);
    });
});
