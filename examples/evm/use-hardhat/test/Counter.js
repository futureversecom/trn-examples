const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Counter", function () {
	async function deployFixture() {
		const CounterFactory = await ethers.getContractFactory("Counter");
		const initialCount = 0;
		const counter = await CounterFactory.deploy(initialCount);

		return { counter, initialCount };
	}

	describe("Deployment", function () {
		it("Should set the correct initial count", async function () {
			const { counter, initialCount } = await loadFixture(deployFixture);

			expect(await counter.getCount()).to.equal(initialCount);
		});
	});

	describe("Interaction", function () {
		it("Should set increase the current count value by 1", async function () {
			const { counter } = await loadFixture(deployFixture);

			await counter.increment();

			expect(await counter.getCount()).to.equal(1);
		});

		it("Should set decrease the current count value by 1", async function () {
			const { counter } = await loadFixture(deployFixture);

			await counter.decrement();

			expect(await counter.getCount()).to.equal(-1);
		});
	});
});
