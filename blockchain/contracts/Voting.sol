// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract Voting is ERC1155, ERC1155Supply, Ownable, ERC1155Burnable {
    constructor() ERC1155("") {
    }

    enum electionStage {Declared, Active, Closed, Results}

    event NewElectionCreate(uint256 votingId, uint256 electionId, string description);
    event NewCandidateRegistered(uint256 votingId, string emailId);
    // event VotingEnabled(uint256 votingId, electionStage stage);
    // event VotingDisabled(uint256 votingId, electionStage stage);
    event VotingStageChange(uint256 votingId, electionStage stage);
    event VotingTokenTransfered(uint256 votingId, uint256 electionId);
    event Voted(uint256 votingId, address candidateAddress);
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    struct VotingDetails {
        uint256 electionId;
        string description;
        electionStage stage;
        address[] candidates;
    }
    
    struct CandidateDetails {
        string candidateName;
        address candidateAddress;
    }
    
    mapping(uint256 => VotingDetails) private votingDetails;
    mapping(string => CandidateDetails) private candidateDetails;
    mapping(string => uint256[]) private tokenDistributedToVoters;

    function initiatedNewVoting(uint256 _votingId, string memory _description) public onlyOwner{
        uint256 _tokenId = _tokenIdCounter.current();
        votingDetails[_votingId].electionId = _tokenId;
        votingDetails[_votingId].description = _description;
        votingDetails[_votingId].stage = electionStage.Declared;
        _tokenIdCounter.increment();
        
        emit NewElectionCreate(_votingId, _tokenId, _description);
    }

    function registerCandidate(string memory _name, string memory _emailId, address _candidateAddress, uint256 _votingId) public {
        require(_candidateAddress != address(0), 'address zero is not allowed');
        require(votingDetails[_votingId].stage == electionStage.Declared,"Election not in declared stage.");
        votingDetails[_votingId].candidates.push(_candidateAddress);
        candidateDetails[_emailId].candidateName = _name;
        candidateDetails[_emailId].candidateAddress = _candidateAddress;
        emit NewCandidateRegistered(_votingId, _emailId);
    }
    
    function changeStage(uint256 _votingId, uint256 _stage) public onlyOwner {
        votingDetails[_votingId].stage = electionStage(_stage);
        emit VotingStageChange(_votingId, votingDetails[_votingId].stage);
    }

    /*
    function disableVoting(uint256 _votingId) public onlyOwner {
        votingDetails[_votingId].stage = electionStage.Closed;
        emit VotingDisabled(_votingId, votingDetails[_votingId].stage);
    }

    function enableVoting(uint256 _votingId) public onlyOwner {
        votingDetails[_votingId].stage = electionStage.Active;
        emit VotingEnabled(_votingId, votingDetails[_votingId].stage);
    }
    */

    function requestVotingToken(string memory _emailId, address _to, uint256 _votingId) public {
        require(votingDetails[_votingId].stage == electionStage.Active, 'Voting is not open yet');
        require(isTokenDistributed(_votingId, _emailId ) == false, 'Token has already transferred to Voter');
        uint256 electionId = votingDetails[_votingId].electionId;
        _mint(_to, electionId, 1, '');
        tokenDistributedToVoters[_emailId].push(_votingId);
        emit VotingTokenTransfered(_votingId, electionId);
    }

    function getVotingTokenCount(uint256 _votingId) public view returns (uint256){
        return totalSupply(votingDetails[_votingId].electionId);
    }

    function getVotingTokenId(uint256 _votingId) public view returns (uint256){
        return votingDetails[_votingId].electionId;
    }

    function isTokenDistributed(uint256 _votingId, string memory _emailId) public view returns (bool){
        uint256[] memory ids = tokenDistributedToVoters[_emailId];
        bool status = false;
        for(uint i=0; i< ids.length; i++){
            if(ids[i] == _votingId){
                status = true;
            }
        }
        return status;
    }

    function isCandidateValid(uint256 _votingId, address _candidateAddress) public view returns (bool){
        for(uint i=0; i< votingDetails[_votingId].candidates.length; i++){
            if(_candidateAddress == votingDetails[_votingId].candidates[i]){
                return true;
            }
        }
        return false;
    }

    function vote(uint256 _votingId, address _candidateAddress) public {
        electionStage _stage = votingDetails[_votingId].stage;
        uint256 electionId = votingDetails[_votingId].electionId;
        require(_stage == electionStage.Active, 'Voting yet to be active');
        require(balanceOf(msg.sender, electionId) == 1, 'Voter does not have voting token');
        require(isCandidateValid(_votingId,_candidateAddress) == true, 'Candidate is not valid');
        safeTransferFrom(msg.sender, _candidateAddress, electionId, 1, "");
        emit Voted(_votingId, _candidateAddress);
    }
  
    function isVotingOpen(uint256 _votingId) public view returns(bool){
        if(votingDetails[_votingId].stage == electionStage.Active){
            return true;
        }
        return false;
    }
    
    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function declareResult(uint256 _votingId) public {
        votingDetails[_votingId].stage = electionStage.Results;
    }
}