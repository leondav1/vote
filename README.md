### Deploy

1. Clone project
```
git clone
```
2. Install packages
```
npm install
```
3. Compile project
```
npx hardhat compile
```
4. Uncomment the line in hardhat.config.js
```
   // require('./tasks/tasks');
```
6. Create file .env
```
touch .env
```
and add some lines
```
API_URL="YOUR API URL"
PRIVATE_KEY=YOUR PRIVATE KEY
CONTRACT_ADDR=
OWNER=""
```
7. **npx hardhat**

### Tasks
## Request examples

1. Create vote
```
npx hardhat createVote --title <title> --candynames <name1, name2, ...> --candyaddrs <address1, address2, ...>
```
2. Add voice
```
npx hardhat addvoice --privatekey <YOUR PRIVATE KEY> --vote <number vote> --candy <numder candidate> --value <amount>
Amount must be more than 0.01 ether (in wei)
```
3. Withdraw fee
```
npx hardhat withdraw --account <address> --value <amount>
Amount must be in wei
```
4. Get info of vote
```
npx hardhat voteinfo --number <number vote>
```
5. Get info of vote candidates
```
npx hardhat candyinfo --number <number vote>
```
6. Get info of vote participants
```
npx hardhat partinfo --number <number vote>
```
7. End vote
```
npx hardhat voteend --number <number vote>
```
