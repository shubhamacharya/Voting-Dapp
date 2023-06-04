# Voting DApp using ERC-1155

The voting DApp using ERC-1155 is a decentralized application built on the Ethereum blockchain that allows users to participate in voting processes in a transparent and secure manner. The DApp utilizes the ERC-1155 token standard, enabling the creation of both fungible and non-fungible tokens within a single smart contract.

## Features

- **Transparent Voting Process**: The DApp provides a transparent and auditable voting process on the Ethereum blockchain.
- **ERC-1155 Token Integration**: ERC-1155 tokens are used as voting units, allowing users to cast their votes by transferring tokens.
- **Real-time Vote Tally**: The smart contract keeps track of the vote tally for each option in real-time, ensuring accurate and up-to-date voting results.
- **Web-Based User Interface**: The DApp includes a user-friendly web-based interface for users to connect their Ethereum wallets, view voting options, and cast votes.
- **Secure and Tamper-Resistant**: By leveraging the security features of the Ethereum blockchain, the DApp ensures the integrity and immutability of the voting process.

## Usage

1. Clone the repository:

> git clone https://github.com/shubhamacharya/Voting-Dapp.git

2. Install dependencies for server:

> cd voting-dapp/server\
npm install

3. Install dependencies for client:

> cd voting-dapp/client\
npm install

4. Start the Ethereum development network:

> npx hardhat node

5. Deploy the Smart Contract and add smart contract address in .env file:

> npx hardhat run scripts/deploy.js --network localhost

7. Start the server:

> cd server && npm start

8. Start the client:

> cd client && npm run dev

9. Access the DApp:

> Open your web browser and visit `http://localhost:5173/` to access the voting DApp.

## Dependencies

- Solidity - Smart contract programming language
- Hardhat - Ethereum development environment
- Node.js - JavaScript runtime environment
- Express.js - Web application framework for Node.js
- MongoDB - Document-oriented database
- Web3.js - Ethereum JavaScript API
- React.js - JavaScript library for building user interfaces

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please create an issue or submit a pull request. Make sure to adhere to the code standards and include relevant tests and documentation.

## License

This project is licensed under the [No License](LICENSE).

