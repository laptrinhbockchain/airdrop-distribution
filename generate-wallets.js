const fs = require('fs');
const Web3 = require("web3");

const WALLET_NUM = 200000;
const BATCH_NUM = 5000;
const WHITELIST_FILE = "whitelist.txt";

function getWeb3() {
    var web3 = new Web3('https://data-seed-prebsc-2-s1.binance.org:8545');
    return web3;
}

function appendFile(filepath, lines) {
    let fd = fs.openSync(filepath, "a");
    lines.forEach(line => {
        fs.writeSync(fd, (line + "\n"));
    });
    fs.closeSync(fd);
}

function generateWallets() {
    let web3 = getWeb3();
    let batch = BATCH_NUM;
    let startTime = Date.now();
    let addresses = [];
    for (let idx=0; idx<WALLET_NUM; idx++) {
        let account = web3.eth.accounts.create();
        addresses.push(account.address);
        if (addresses.length>=batch) {
            appendFile(WHITELIST_FILE, addresses);
            addresses = [];
            console.log(`Generated ${idx+1}/${WALLET_NUM} addresses in ${((Date.now() - startTime)/(60*1000)).toFixed(2)} mins...`);
        }   
    }
    if (addresses.length>0) {
        console.log(`Generated ${WALLET_NUM}/${WALLET_NUM} addresses in ${((Date.now() - startTime)/(60*1000)).toFixed(2)} mins...`);
    }
    console.log("DONE!!!");
}

generateWallets();