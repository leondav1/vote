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