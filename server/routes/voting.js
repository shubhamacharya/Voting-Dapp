const express  = require("express");
const routes = express.Router();
const mongoose = require('mongoose');
const {getContractObj, generateUsers } = require('../utils/helper');
const Elections = require("../models/Elections");
const Candidates = require("../models/Candidates");
const Voters = require("../models/Voters");
const Users = require("../models/Users");

routes.post('/createElection', async(req, res) => {
    try 
    {
        const {votingId, description, adminAddress} = req.body;
        
        if(votingId == 0 || description == ''){
            throw new Error('VotingId and description can not be null');
        }
        const votingContract = await getContractObj();
    
        await votingContract.methods.initiatedNewVoting(votingId, description).send({
            from: adminAddress
        }).on('error', (error, receipt) => {
            console.log(error.reason);
            res.json({"error": error.reason});
        }).on('receipt', async (tx) => {
            if(tx.status == 1){
            
                const election = new Elections();
        
                election.votingId = tx.events.NewElectionCreate.returnValues.votingId
                election.electionId = tx.events.NewElectionCreate.returnValues.electionId
                election.description = tx.events.NewElectionCreate.returnValues.description
                election.stage = 0 // Declared stage code == 0;
                await election.save();
                res.json({"transactionHash" : tx.transactionHash});
            } 
        });
    }
    catch (error) {
        if(error.code == 11000){
            res.json({"error":'Election with Id '+votingId+' already exists'})
        }
        else if(error.message.includes('invalid BigNumber string')){
            res.json({"error":'Election Id can not be an String.\nPlease provide numeric value.'})
        }
    }
});

routes.post('/registerCandidate', async(req, res) => {
    const votingContract = await getContractObj();
    
    let tnx = req.body.candidates.map(async (candidate, index) => {
        const { name, email, candidateAddress, votingId } = candidate;
        if( name != undefined && 
            email != undefined && 
            candidateAddress != undefined && 
            votingId != undefined
        )
        {
            const dbCandidate = new Candidates();
            const electionObj = await  Elections.findOne({votingId:votingId});

            let tx = await votingContract.methods.registerCandidate(name, email, candidateAddress, votingId).send({
                from: req.body.adminAddress,
                nonuce: index,
                gas: 29999999,
            }).on('error', (error, receipt) => {
                res.json({"error": error.reason});
            })
            
            dbCandidate.candidateAddress = candidateAddress;
            dbCandidate.name = name;
            dbCandidate.email = email;
            electionObj.candidates.push(await dbCandidate.save());
            await electionObj.save();
            return tx.transactionHash;
        }
        else{
            res.json({"error": 'Fill out all the fields.'});
        }
    });
    res.json({"transactionHash": await Promise.all(tnx)});
});

/* routes.post('/disableVoting', async(req, res) => {
    try{
        const {votingId, adminAddress} = req.body;
        const electionObj = await  Elections.findOne({votingId:votingId});

        const votingContract = await getContractObj(adminAddress);
        let tx = await votingContract.methods.disableVoting(votingId).send({
            from: adminAddress
        });
        electionObj.stage = tx.events.VotingDisabled.returnValues.stage;
        await electionObj.save();

        res.json({"success": 'Voting for Election with Id '+votingId+' is disabled'});
    }catch(exceptionObj){
        res.json({"error": exceptionObj.message})
    }
});

routes.post('/enableVoting', async(req, res) => {
    try{
        const {votingId, adminAddress} = req.body;
        const electionObj = await  Elections.findOne({votingId:votingId});

        const votingContract = await getContractObj(adminAddress);
        let tx = await votingContract.methods.enableVoting(votingId).send({
            from: adminAddress
        });

        electionObj.stage = tx.events.VotingEnabled.returnValues.stage;
        await electionObj.save();

        res.json({"success": 'Voting for Election with Id '+votingId+' is enabled'});
    }catch(exceptionObj){
        res.json({"error": exceptionObj.message})
    }
}); */

routes.post('/requestVotingTokens',async (req,res) => {
    try {
        const {emailId,signer,votingId} = req.body;
        const votingContract = await getContractObj(signer);
        await votingContract.methods.requestVotingToken(emailId,signer,votingId).send({
            from: signer,
            gas: 29999999,
        }).on('error', (error, receipt) => {
            res.json({"error": error.reason});
        }).on('receipt', async (tx) => {
            let dbVoters = await Voters.findOne({voterEmail: emailId});
            if(dbVoters == null || dbVoters == undefined){
                dbVoters = new Voters();
                dbVoters.voterEmail = emailId;
            }
        
            dbVoters.votingId.push(votingId);
            await dbVoters.save();

            res.json({"transactionHash":tx});
        });
    } catch (error) {
        res.json({"error": error});
    }
});

routes.get('/checkTokenDistributed', async (req, res) => {
    const {sender, votingId, emailId} = req.query;
    const votingContract = await getContractObj();
    let tx = await votingContract.methods.isTokenDistributed(votingId, emailId).call({
        from: sender
    }).on('error', (error, receipt) => {
        res.json({"error": error.reason});
    }).on('receipt', async (tx) => {
        res.json({"isTokenDistributed" : tx})
    });    
});

routes.get('/getVotingTokenCount',async (req, res) => {
    const {sender, votingId} = req.query;
    const votingContract = await getContractObj();
    await votingContract.methods.getVotingTokenCount(votingId).call({
        from: sender
    }).on('error', (error, receipt) => {
        res.json({"error": error.reason});
    }).on('receipt', async (tx) => {
        res.json({"totalVotingTokens":tx});
    });
});

routes.get('/getElectionTokenId',async (req, res) => {
    const {sender, votingId} = req.query;
    const votingContract = await getContractObj(sender);
    await votingContract.methods.getVotingTokenId(votingId).call({
        from: sender
    }).on('error', (error, receipt) => {
        res.json({"error": error.reason});
    }).on('receipt', async(tx) => {
        res.json({"votingTokenId":tx});
    });
});

routes.get('/validateCandidate',async (req, res) => {
    const {candidateAddress, sender, votingId} = req.query
    const votingContract = await getContractObj();
    await votingContract.methods.isCandidateValid(votingId, candidateAddress).call({
        from: sender
    }).on('error', (error, receipt) => {
        res.json({"error": error.reason});
    }).on('receipt', async (tx) => {
        res.json({"isValid": tx})
    });
});

routes.get('/isVotingOpen',async (req, res) => {
    const {adminAddress, votingId} = req.query
    const votingContract = await getContractObj();
    let tx = await votingContract.methods.isVotingOpen(votingId).call({
        from: adminAddress
    });
    
    res.json({"isVotingOpen": tx})
    
})

routes.post('/vote', async (req, res) => {
    const {candidateAddress, voterAddress, votingId} = req.body;
    const votingContract = await getContractObj();
    let tx = await votingContract.methods.vote(votingId, candidateAddress).send({
        from: voterAddress
    }).on('error', (error, receipt) => {
        res.json({"error": error.reason});
    }).on('receipt', (receipt) => {
        res.json({"message": "Your vote to "+candidateAddress+" has been registered."});
    });
});

routes.post('/changeVotingStage', async (req, res) => {
    const {votingId, stage, adminAddress} = req.body;
    const votingContract = await getContractObj();
    
    const tx = await votingContract.methods.changeStage(votingId, stage).send({
        from: adminAddress
    }).on('error', (error, receipt) => {
        res.json({"error": error.reason});
    });

    const result = tx.events.VotingStageChange.returnValues;

    let dbElection = await Elections.findOne({votingId: result.votingId});
    dbElection.stage = result.stage;
    await dbElection.save();

    res.json({"message": "Stage changed to "+result.stage+" for electionId "+result.votingId});
});

routes.get('/votesOfCandidate', async (req, res) => {
    const {candidateAddress, votingId, sender} = req.query;
    const votingContract = await getContractObj();
    let tokenId = await votingContract.methods.getVotingTokenId(votingId).call({
        from: sender
    });
    let tx = await votingContract.methods.balanceOf(candidateAddress, tokenId).call({
        from: sender
    });
    res.json({"candidate": candidateAddress, "votes": tx});
});

routes.get('/votesOfAllCandidates', async (req, res) => {
    let {candidateAddresses, votingId, sender} = req.query;
    const votingContract = await getContractObj();
    candidateAddresses = candidateAddresses.split(',');
    let votingIds = [];

    let tokenId = await votingContract.methods.getVotingTokenId(votingId).call({
        from: sender
    });

    candidateAddresses.forEach(candidate => {
        votingIds.push(tokenId)
    });
    let tx = await votingContract.methods.balanceOfBatch(candidateAddresses, votingIds).call({
        from: sender
    });

    let result = {};
    
    candidateAddresses.forEach((candidate, index) => {
        result[candidate] = tx[index];
    });

    res.json({"results": result});
});

routes.get('/activeElections', async (req, res) => {
    const activeElections = await Elections.find({stage: 1});
    res.json({"activeElections": activeElections});
});

routes.get('/allVotingsId', async (req, res) => {
    const  allDeclaredVotingsId = req.query.stage == undefined 
                                ? await Elections.find().select('votingId description')
                                : await Elections.find().where({stage:req.query.stage}).select('votingId description');
    res.json({"allVotingsId" : allDeclaredVotingsId})
});

routes.post('/login',async (req, res) => {
    const {email, password} = req.body;
    const count = await Users.countDocuments({}).exec();

    if(count == 0){
        generateUsers();
    }
    const dbUser = await Users.findOne({email});

    if(dbUser == null || dbUser == undefined || dbUser.password != password || password == ''){
        res.json({"error":"Invalid username or password."});
    }
    else{
        if (dbUser.role == 'admin') {
            res.json({"message":"Login Success", "url":"/admin"});
        }
        else{
            res.json({"message":"Login Success", "url":"/dashboard"});
        }
    }
});

routes.get('/getCandidates', async (req, res) => {
    const { votingId } = req.query;
    const  result = await Elections.findOne({votingId : votingId}).select('candidates');
    if(result !== null)
    {
        res.json({"candidates" : result.candidates})
    }
    else{
        res.json({"error": "No candidates found"})
    }
});


module.exports = routes;