require("@nomiclabs/hardhat-web3");
require('dotenv').config();
const { getDefaultProvider, ethers } = require("ethers");
const { task } = require("hardhat/config");
const VoteArtefact = require('../artifacts/contracts/Vote.sol/VoteContract.json');
const { PRIVATE_KEY, CONTRACT_ADDR } = process.env;

// Make a create vote
task('create-vote', 'Create new vote')
    .addParam("title", "Title vote")
    .addParam("candy-names", "Candidates array")
    .addParam("candy-addrs", "Array addresses")
    // .addParam("duration", "Duration vote (sec). If 0 then default duration (3 days)")
    .setAction(async (taskArgs) => {
        const provider = new getDefaultProvider("rinkeby");
        const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
        const contractAddr = CONTRACT_ADDR;
        const Contract = new ethers.Contract(
            contractAddr,
            CryptonArtefact.abi,
            ownerWalletWithProvider
        )
        
        const targetTitle = web3.utils.toChecksumAddress(taskArgs.title);
        const targetCandyNames = web3.utils.toChecksumAddress(taskArgs.candy-names);
        const targetAddr = web3.utils.toChecksumAddress(taskArgs.candy-addrs);
        // const targetDuration = web3.utils.toChecksumAddress(taskArgs.duration);
        const sumFunds = await Contract.connect(ownerWalletWithProvider).createVote(
            targetTitle,
            targetCandyNames,
            targetAddr,
            0
        );
        console.log('Create new vote', sumFunds.title)
    });

task('addvoice', 'Take part in the voting by indicating the number of the vote and the number of the candidate')
    .addParam("privatekey", "Account's private key")    
    .addParam("vote", "Vote number")
    .addParam("candy", "Candidate number")
    .setAction(async (taskArgs) => {
        const provider = new getDefaultProvider("rinkeby");
        const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
        const senderWalletWithProvider = new ethers.Wallet(taskArgs.privatekey, provider);
        const contractAddr = CONTRACT_ADDR;
        const Contract = new ethers.Contract(
            contractAddr,
            CryptonArtefact.abi,
            ownerWalletWithProvider
        )
        const senderAddr = senderWalletWithProvider.address
        const sum = ethers.utils.parseEther(taskArgs.value);
        const vote = ethers.utils.parseEther(taskArgs.vote);
        const candy = ethers.utils.parseEther(taskArgs.candy);
        const tx = await Contract.connect(senderWalletWithProvider).addVoice(vote, candy, { value: sum });
        tx.wait();

        console.log('Balance on contract', contractAddr, web3.utils.fromWei(String(await Contract.connect(ownerWalletWithProvider).currentBalance()), "ether"), "ETH")
        console.log('Balance on', senderAddr, web3.utils.fromWei(String(await Contract.connect(ownerWalletWithProvider).addrBalance(senderAddr)), "ether"), "ETH");
    });

task("voteinfo", "Get info of vote")
    .addParam("number", "Vote number")
    .setAction(async () => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          CryptonArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = ethers.utils.parseEther(taskArgs.number);
      const vote = await Contract.connect(ownerWalletWithProvider).infoVote(number);
  
      console.log(vote);
    });

task("candyinfo", "Get info of vote candidates")
    .addParam("number", "Vote number")
    .setAction(async () => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          CryptonArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = ethers.utils.parseEther(taskArgs.number);
      const candidates = await Contract.connect(ownerWalletWithProvider).infoCandidate(number);
  
      console.log(candidates);
    });

task("partinfo", "Get info of vote participants")
    .addParam("number", "Vote number")
    .setAction(async () => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          CryptonArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = ethers.utils.parseEther(taskArgs.number);
      const participants = await Contract.connect(ownerWalletWithProvider).infoParticipants(number);
  
      console.log(participants);
    });

task("voteend", "End vote")
    .addParam("number", "Vote number")
    .setAction(async () => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          CryptonArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = ethers.utils.parseEther(taskArgs.number);
      const endVote = await Contract.connect(ownerWalletWithProvider).endVote(number);
  
      console.log("Vote stopped:", endVote);
    });
