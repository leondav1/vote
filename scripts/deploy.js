const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const Vote = await ethers.getContractFactory("VoteContract");
  const vote = await Vote.deploy();

  await vote.deployed();

  console.log("Vote deployed to:", vote.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });