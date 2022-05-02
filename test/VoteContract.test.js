const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('VoteContract', function() {
    let owner
    let acc1
    let acc2
    let acc3
    let acc4
    let acc5
    let votecontract
    const FEE = 10

    beforeEach(async function() {
        [owner, acc1, acc2, acc3, acc4, acc5, _] = await ethers.getSigners()
        const VoteContract = await ethers.getContractFactory('VoteContract', owner)
        // Ждём, пока транзакция будет отправлена
        votecontract = await VoteContract.deploy()
        // Ждём, пока транзакция будет выполнена
        await votecontract.deployed()
    })

    it('Should be deployed', async () => {
        expect(votecontract.address).to.be.properAddress
    })

    it('sets owner', async function() {
        const currentOwner = await votecontract.owner()
        expect(currentOwner).to.eq(owner.address)
    })

    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }

    describe("createVote", function() {
        async function getTimestamp(bn) {
            return (
                await ethers.provider.getBlock(bn)
            ).timestamp
        }
    
        it('Should be create vote', async() => {
            duration = 259200
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            const cVote = await votecontract.votes(1)
            const candidates = await votecontract.infoCandidate(1)
    
            expect(cVote.title).to.eq("New vote")
            expect(candidates[0].name).to.eq(candys[0])
            const ts = await getTimestamp(tx.blockNumber)
            expect(Number(cVote.endsAt)).to.eq(ts + duration)
        })
    
        it('Should be not create vote because double addresses', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc1.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            const candidates = await votecontract.infoCandidate(1)
    
            expect(candidates.length).to.eq(0)
        })
    })

    describe("addVoice", function() {
        it('Should be can voice', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            
            const sum = ethers.utils.parseEther("0.01")
            const tx1 = await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            const candidates = await votecontract.infoCandidate(1)
            const participants = await votecontract.infoParticipants(1)
            expect(Number(candidates[0].voteCount)).to.eq(1)
            expect(participants[0]).to.eq(acc5.address)
            const cVote = await votecontract.votes(1)
            const fee = ((sum * FEE) / 100)
            const vb = sum - fee
            expect(cVote.voutingBudget).to.eq(vb)
            const currentBalance = await votecontract.currentBalance()
            expect(currentBalance).to.eq(sum)
            expect(Number(await votecontract.summFee())).to.eq(fee)
        })
        
        it("Should be cannot re-vote", async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            
            const sum = ethers.utils.parseEther("0.01")
            const tx1 = await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            try {
                await votecontract.connect(acc5).addVoice(1, 2, {value: sum})
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'you cannot re-vote'")
            }
        })

        it("Should be not enough fund", async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            
            const sum = ethers.utils.parseEther("0.005")
            try {
                await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'not enough fund'")
            }
        })

        it("Should be voting is over", async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 1)
            sleep(2000)
            const sum = ethers.utils.parseEther("0.01")
            try {
                await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'voting is over'")
            }
        })
    })

    describe("withdrawFee", function() {
        it('Should be can withdraw fee', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            const sum = ethers.utils.parseEther("0.01")
            const tx1 = await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            const fee = ((sum * FEE) / 100)
            const cVote = await votecontract.votes(1)
            const sumWith = ethers.utils.parseEther("0.0005")
            // console.log("1=>", Number(await votecontract.summFee()))
            
            const txWith = await votecontract.connect(owner).withdrawFee(acc5.address, sumWith)
            // console.log("2=>", Number(await votecontract.summFee()))
            const feeOnBalance = fee - Number(sumWith)
            expect(Number(await votecontract.summFee())).to.eq(feeOnBalance)
        })

        it('Withdrawal amount exceeded', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            const sumWith = ethers.utils.parseEther("0.0005")
            try {
                await votecontract.connect(owner).withdrawFee(acc5.address, sumWith)
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'withdrawal limim exceeded'")
            }
        })
    })

    it('Should be view info about vote', async() => {
        const candys1 = ['candidate1', 'candidate2']
        const addr1 = [acc1.address, acc2.address]
        const tx1 = await votecontract.createVote("New vote", candys1, addr1, 0)
        const cVote1 = await votecontract.infoVote(1)
        const candys2 = ['candidate3', 'candidate4']
        const addr2 = [acc3.address, acc4.address]
        const tx2 = await votecontract.createVote("Enother vote", candys2, addr2, 0)
        const cVote2 = await votecontract.infoVote(2)
        expect(cVote1.title).to.eq("New vote")
        expect(cVote2.title).to.eq("Enother vote")
    })

    it('Should be view info about candidates', async() => {
        const candys = ['candidate1', 'candidate2']
        const addr = [acc1.address, acc2.address]
        const tx = await votecontract.createVote("New vote", candys, addr, 0)
        const candidates = await votecontract.infoCandidate(1)
        expect(candidates[0].candyAddr).to.eq(acc1.address)
        expect(candidates[1].name).to.eq("candidate2")
    })

    it('Should be view info about participants', async() => {
        const candys = ['candidate1', 'candidate2']
        const addr = [acc1.address, acc2.address]
        const tx = await votecontract.createVote("New vote", candys, addr, 0)
        const sum = ethers.utils.parseEther("0.01")
        const tx1 = await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
        const participants = await votecontract.infoParticipants(1)
        expect(participants[0]).to.eq(acc5.address)
    })

    describe("endVote", function() {
        it('Should be end vote', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 2)
            
            const sum = ethers.utils.parseEther("0.01")
            const tx1 = await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            sleep(2000)
            const eVote = await votecontract.endVote(1)
            const cVote = await votecontract.votes(1)
            expect(cVote.stopped).to.eq(true)
            expect(cVote.winner).to.eq("candidate1")
        })

        it('Should be is active', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 0)
            try {
            const eVote = await votecontract.endVote(1)
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'voting is still active'")
            }
        })

        it('Should be voting has ended', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 2)
            const sum = ethers.utils.parseEther("0.01")
            const tx1 = await votecontract.connect(acc5).addVoice(1, 1, {value: sum})
            sleep(2000)
            const eVote = await votecontract.connect(acc5).endVote(1)

            try {
            const eVote = await votecontract.endVote(1)
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'voting has ended'")
            }
        })
        it('Must be a participant', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 2)
            const sum = ethers.utils.parseEther("0.01")
            sleep(3000)
            
            try {
                const eVote = await votecontract.connect(acc4).endVote(1)
            } catch (error) {
                expect(error.message).to.eq("VM Exception while processing transaction: reverted with reason string 'You must be a participant'")
            }
        })

        it('Should be no winner', async() => {
            const candys = ['candidate1', 'candidate2']
            const addr = [acc1.address, acc2.address]
            const tx = await votecontract.createVote("New vote", candys, addr, 1)
            sleep(2000)
            
            const eVote = await votecontract.connect(owner).endVote(1)
            const cVote = await votecontract.votes(1)
            expect(cVote.winner).to.eq("No winner")
        })
    })
})