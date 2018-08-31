const argv = require("yargs").argv;
const ecc = require("eosjs-ecc");
const eth = require("ethereumjs-util");
const bip39 = require("bip39");
const hdkey = require("ethereumjs-wallet/hdkey");

if (!process.env.ETH_MNEMONIC)
  throw new Error("Missing required env variable ETH_MNEMONIC");

if (!argv.count) argv.count = 10;

const ethAddressList = generateAddressesFromSeed(process.env.ETH_MNEMONIC, argv.count);

createEosKeyFromEthKey(ethAddressList);

function generateAddressesFromSeed(seed, count) {
  const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(seed));
  const wallet_hdpath = "m/44'/60'/0'/0/";
  const accounts = [];

  for (let i = 0; i < count; i++) {
    const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
    const address = "0x" + wallet.getAddress().toString("hex");
    const privateKey = wallet.getPrivateKey().toString("hex");
    accounts.push({ address: address, privateKey: privateKey });
  }

  return accounts;
}

function createEosKeyFromEthKey(ethAddressList) {
  ethAddressList.forEach((item, index) => {
    const ethereumPrivateKey = item.privateKey;

    if (eth.isValidPrivate(Buffer.from(ethereumPrivateKey, "hex"))) {
      const ethereumAddress =
        "0x" +
        eth
          .privateToAddress(Buffer.from(ethereumPrivateKey, "hex"))
          .toString("hex");

      const ethereumPublicKey = eth
        .privateToPublic(Buffer.from(ethereumPrivateKey, "hex"))
        .toString("hex");

      // Create EOS keys
      const eosWIF = ecc
        .PrivateKey(Buffer.from(ethereumPrivateKey, "hex"))
        .toWif();

      const convertedEOSPrivateKey = eosWIF;
      const convertedEOSPublicKey = ecc.privateToPublic(eosWIF);

      console.log(`\nEOS Public Key ${index + 1}: ${convertedEOSPublicKey}`);
      console.log(`EOS Private Key ${index + 1}: ${convertedEOSPrivateKey}`);
    } else {
      console.log("Invalid Ethereum Private Key");
    }
  });
}
