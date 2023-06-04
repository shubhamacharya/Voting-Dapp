const { ethers } = require("ethers");
var Web3 = require('web3');
require("dotenv").config({path: "../.env"});
const fsPromise = require('fs/promises');
const Users = require("../models/Users");

let votingContract;
const web3 = new Web3(Web3.givenProvider || process.env.PROVIDER);
const getABI = async () => {
    const data = await fsPromise.readFile(process.env.VOTING_CONTRACT_ABI_PATH, 'utf-8');
    return await JSON.parse(data)['abi'];
}

const deployContract = async () => {
    const votingABI = await getABI();
    votingContract = new web3.eth.Contract(votingABI, process.env.VOTING_CONTRACT_ADDRESS);
    votingContract.options.handleRevert = true;
}

const getContractObj = async () => {
    if(votingContract === undefined)
        await deployContract();
    return votingContract;
}

const generateUsers = async () => {
    const users = [
                    {email:'admin@gmail.com',password:'admin',role:'admin'},
                    {email:'voter1@gmail.com',password:'voter1',role:'user'},
                    {email:'voter2@gmail.com',password:'voter2',role:'user'},
                    {email:'voter3@gmail.com',password:'voter3',role:'user'},
                    {email:'voter4@gmail.com',password:'voter4',role:'user'},
                    {email:'candidate1@gmail.com',password:'candidate1',role:'user'},
                    {email:'candidate2@gmail.com',password:'candidate2',role:'user'},
                ];
    await Users.insertMany(users);
}

module.exports = {getContractObj, generateUsers};


