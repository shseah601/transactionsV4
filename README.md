## Environment Setup

- Node package manager [Nodejs](https://nodejs.org/en/)
- [Ganache](https://nodejs.org/en/)
- Install truffle with the command
    ```
    npm install -g truffle
    ```
- Install node dependencies
    ```
    npm install
    ```

## Usage
1. Make sure ganache is running to simulate ethereum node.
2. Build the smart contract. ( --reset option is to overwrite the build file if exists)
    ```
    truffle migrate --reset
    ```
3. Build webpack file.
    ```
    npm run webpack
    ```
4. Start express server.
    ```
    npm run start
    ```
5. Run the following command in the root folder for combining both step 2 & 3.
    ```
    npm run dev
    ```
