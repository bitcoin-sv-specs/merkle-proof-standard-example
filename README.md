# merkle-proof-standard-example

## Requirements

For development, you will only need Node.js (minimum 10.12.0) and a node global package, NPM, installed in your environement.

### Node

- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

    ```sh
    $ sudo apt install nodejs
    $ sudo apt install npm
    ```

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

## Install

```sh
$ git clone https://github.com:bitcoin-sv-specs/merkle-proof-standard-example.git
$ cd merkle-proof-standard-example
$ npm install
```

## Run

```sh
$ npm start
```

## Code Style

The JavaScript code in this repository is written using [JavaScript Standard Style](https://standardjs.com/).

## Flags

| Flag | TxOrId | Target       | Proof type | Composite proof |
|------|--------|--------------|------------|-----------------|
| 0    | txid   | block hash   | branch     | single          |
| 1    | txhex  | block hash   | branch     | single          |
| 2    | txid   | block header | branch     | single          |
| 3    | txhex  | block header | branch     | single          |
| 4    | txid   | merkle root  | branch     | single          |
| 5    | txhex  | merkle root  | branch     | single          |
