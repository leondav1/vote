require("@nomiclabs/hardhat-web3");
require('dotenv').config();
const { getDefaultProvider, ethers } = require("ethers");
const { task } = require("hardhat/config");
const VoteArtefact = require('../artifacts/contracts/Vote.sol/VoteContract.json');
const { PRIVATE_KEY, CONTRACT_ADDR } = process.env;

// Make a create vote
task('createVote', 'Create new vote')
    .addParam("title", "Title vote")
    .addParam("candynames", "Candidates array")
    .addParam("candyaddrs", "Array addresses")
    // .addParam("duration", "Duration vote (sec). If 0 then default duration (3 days)")
    .setAction(async (taskArgs) => {
        const provider = new getDefaultProvider("rinkeby");
        const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
        const contractAddr = CONTRACT_ADDR;
        const Contract = new ethers.Contract(
            contractAddr,
            VoteArtefact.abi,
            ownerWalletWithProvider
        )
        
        const targetTitle = taskArgs.title
        const targetCandyNames = taskArgs.candynames.split(",")
        const targetAddr = taskArgs.candyaddrs.split(",")
        // const targetDuration = web3.utils.toChecksumAddress(taskArgs.duration);
        const createVote = await Contract.connect(ownerWalletWithProvider).createVote(
            targetTitle,
            targetCandyNames,
            targetAddr,
            0
        );
        console.log('Create new vote', createVote)
    });

task('addvoice', 'Take part in the voting by indicating the number of the vote and the number of the candidate')
    .addParam("privatekey", "Account's private key")    
    .addParam("vote", "Vote number")
    .addParam("candy", "Candidate number")
    .addParam("value", "Amount funds")
    .setAction(async (taskArgs) => {
        const provider = new getDefaultProvider("rinkeby");
        const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
        const senderWalletWithProvider = new ethers.Wallet(taskArgs.privatekey, provider);
        provider.getGasPrice()
        const contractAddr = CONTRACT_ADDR;
        const Contract = new ethers.Contract(
            contractAddr,
            VoteArtefact.abi,
            ownerWalletWithProvider
        )
        // const senderAddr = senderWalletWithProvider.address
        const sum = ethers.utils.parseEther(taskArgs.value);
        const vote = taskArgs.vote;
        const candy = taskArgs.candy;
        const tx = await Contract.connect(senderWalletWithProvider).addVoice(vote, candy, { value: sum });
        tx.wait();

        console.log('Voice added', tx)
    });

task("withdraw", "Withdraw fee to a specific address in a specific amount")
  .addParam("account", "The address of the account to which the withdrawal is made")
  .addParam("value", "Amount funds")
  .setAction(async (taskArgs) => {
    const provider = new getDefaultProvider("rinkeby")
    const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider)
    provider.getGasPrice()
    const contractAddr = CONTRACT_ADDR
    const Contract = new ethers.Contract(
        contractAddr,
        VoteArtefact.abi,
        ownerWalletWithProvider
    )

    const _to = web3.utils.toChecksumAddress(taskArgs.account)
    const sum = ethers.utils.parseEther(taskArgs.value)

    const tx = await Contract.connect(ownerWalletWithProvider).withdrawFee(_to, sum)
    tx.wait()

    console.log(tx)
    })

task("voteinfo", "Get info of vote")
    .addParam("number", "Vote number")
    .setAction(async (taskArgs) => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          VoteArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = taskArgs.number;
      const vote = await Contract.connect(ownerWalletWithProvider).infoVote(number);
  
      console.log(vote);
    })

task("candyinfo", "Get info of vote candidates")
    .addParam("number", "Vote number")
    .setAction(async (taskArgs) => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          VoteArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = taskArgs.number;
      const candidates = await Contract.connect(ownerWalletWithProvider).infoCandidate(number);
  
      console.log(candidates);
    })

task("partinfo", "Get info of vote participants")
    .addParam("number", "Vote number")
    .setAction(async (taskArgs) => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          VoteArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = taskArgs.number;
      const participants = await Contract.connect(ownerWalletWithProvider).infoParticipants(number);
  
      console.log(participants);
    })

task("voteend", "End vote")
    .addParam("number", "Vote number")
    .setAction(async (taskArgs) => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          VoteArtefact.abi,
          ownerWalletWithProvider
      )
      
      const number = taskArgs.number;
      const endVote = await Contract.connect(ownerWalletWithProvider).endVote(number);
  
      console.log("Vote stopped:", endVote);
    })

task("balance", "View contract balance")
    .setAction(async (taskArgs) => {
      const provider = new getDefaultProvider("rinkeby");
      const ownerWalletWithProvider = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
      const contractAddr = CONTRACT_ADDR;
      const Contract = new ethers.Contract(
          contractAddr,
          VoteArtefact.abi,
          ownerWalletWithProvider
      )
      
      const balance = await Contract.connect(ownerWalletWithProvider).currentBalance();
  
      console.log("Contract balance:", web3.utils.fromWei(String(balance), "ether"), "ETH");
    })
