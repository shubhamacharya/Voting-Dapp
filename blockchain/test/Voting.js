const { expect } = require('chai');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe('Voting Contract', () => {

    async function deployContract() {
        const [owner, C1, C2, C3, V1, V2, V3, V4] = await ethers.getSigners();
        const Voting = await ethers.getContractFactory('Voting');
        const votingContract = await Voting.deploy();

        return {owner, votingContract, C1, C2, C3, V1, V2, V3, V4};
    }

    async function createElection(votingContract) {
        let tx  = await votingContract.initiatedNewVoting(1,'Test voting 1');
        let election = await tx.wait();
        let votingId = await election.events[0].args.votingId.toNumber();        
        return votingId;
    }

    async function addCandidatesAndVoters(votingContract, C1, C2, C3, V1, V2, V3) {
        let votingId = await createElection(votingContract)
        
        await votingContract.enableVoting(votingId);

        await votingContract.registerCandidate('C1', 'c1@gmail.com',C1.address, votingId);
        await votingContract.registerCandidate('C2', 'c2@gmail.com',C2.address, votingId);
        await votingContract.registerCandidate('C3', 'c3@gmail.com',C3.address, votingId);

        await votingContract.requestVotingToken('c1@gmail.com',C1.address,votingId);
        await votingContract.requestVotingToken('c2@gmail.com',C2.address,votingId);
        await votingContract.requestVotingToken('c3@gmail.com',C3.address,votingId);
        await votingContract.requestVotingToken('v1@gmail.com',V1.address,votingId);
        await votingContract.requestVotingToken('v2@gmail.com',V2.address,votingId);
        await votingContract.requestVotingToken('v3@gmail.com',V3.address,votingId);
        return votingId;
    }

    it('should create new voting ', async () => {
        const {owner, votingContract} = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        expect(
            await votingContract.initiatedNewVoting(votingId,'Test voting 1')
        ).to.emit(votingContract, "NewElectionCreate");
    });

    it('should should throw error on candidate register',async () => {
        const {owner, votingContract, C1} = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        await expect(
            votingContract.registerCandidate('C1', 'c1@gmail.com',ethers.constants.AddressZero, votingId)
        ).to.revertedWith('address zero is not allowed');
        expect(
            await votingContract.registerCandidate('C1', 'c1@gmail.com',C1.address, votingId)
        ).to.emit(votingContract, "NewCandidateRegistered");
    });

    it('should activate the voting',async () => {
        const { owner, votingContract } = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        expect(await votingContract.enableVoting(votingId)).to.emit(votingContract,"VotingEnabled");
    });

    it('should disable the voting',async () => {
        const { owner, votingContract } = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        expect(await votingContract.disableVoting(votingId)).to.emit(votingContract,"VotingDisabled");
    });

    it('should validate the candidate',async () => {
        const { owner, votingContract, C1, C2 } = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        await votingContract.registerCandidate('C1', 'c1@gmail.com', C1.address, votingId);

        expect(await votingContract.isCandidateValid(votingId, C1.address)).to.equal(true);
        expect(await votingContract.isCandidateValid(votingId, C2.address)).to.equal(false);
    });

    it('should throw error of inactive election on request token',async () => {
        const { owner, votingContract, C1, C2, V1, V2, V3, V4} = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        await expect(votingContract.requestVotingToken('c1@gmail.com',V1.address,votingId)).to.revertedWith("Voting is not open yet");

        await votingContract.enableVoting(votingId);
        
        expect(await votingContract.requestVotingToken('c1@gmail.com',V1.address,votingId)).to.emit(votingContract, "VotingTokenTransfered");
    });

    it('should mint and transfer voting token',async () => {
        const { owner, votingContract, C1, C2, V1, V2, V3, V4} = await loadFixture(deployContract);
        
        let votingId = createElection(votingContract);
        await votingContract.enableVoting(votingId);
        
        expect(
            await votingContract.requestVotingToken('c1@gmail.com',V1.address,votingId)
        ).to.emit(votingContract, "VotingTokenTransfered");
    });

    it('should throw error of token already transffered',async () => {
        const { owner, votingContract, C1, C2, V1, V2, V3, V4} = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        await votingContract.enableVoting(votingId);

        await votingContract.requestVotingToken('c1@gmail.com',V1.address,votingId);
        await expect(
            votingContract.requestVotingToken('c1@gmail.com',V1.address,votingId)
        ).to.revertedWith("Token has already transferred to Voter");
    });

    it('should return count of voting tokens',async () => {
        const { owner, votingContract, C1, C2, V1, V2, V3, V4} = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        await votingContract.enableVoting(votingId);

        await votingContract.requestVotingToken('c1@gmail.com',V1.address,votingId);
        
        expect(await votingContract.getVotingTokenCount(votingId)).to.equal(1);
        expect(await votingContract.isTokenDistributed(votingId, 'c1@gmail.com'));
    });

    it('should check all errors on voting',async () => {
        const { owner, votingContract, C1, C2, V1, V2, V3, V4} = await loadFixture(deployContract);
        let votingId = createElection(votingContract);
        expect(await votingContract.isVotingOpen(votingId)).to.false;
        await expect(votingContract.connect(V1).vote(votingId, C1.address)).to.revertedWith('Voting is closed');
        
        await votingContract.enableVoting(votingId);
        await votingContract.requestVotingToken('v1@gmail.com',V1.address,votingId);

        await expect(votingContract.connect(V1).vote(votingId, owner.address)).to.revertedWith('Candidate is not valid');

    });

    it('should register the vote to canditate',async () => {
        const { owner, votingContract, C1, C2, C3, V1, V2, V3 } = await loadFixture(deployContract);

        let votingId = addCandidatesAndVoters(votingContract, C1, C2, C3, V1, V2, V3);

        await votingContract.connect(V1).vote(votingId, C1.address);
        await votingContract.connect(V2).vote(votingId, C2.address);
        await votingContract.connect(V3).vote(votingId, C1.address);
        
        await expect(votingContract.connect(V1).vote(votingId, C1.address)).to.revertedWith('Voter does not have voting token');

        let electionId = await votingContract.getVotingTokenId(votingId);
        let C1Balance = await votingContract.balanceOf(C1.address, electionId);
        let V1Balance = await votingContract.balanceOf(V1.address, electionId);

        expect(C1Balance.toNumber()).equal(3);
        expect(V1Balance.toNumber()).equal(0);
    });
});