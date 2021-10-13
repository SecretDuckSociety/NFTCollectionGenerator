const myArgs = process.argv.slice(2);
const { defaultNumNfts } = require("./src/settings.js");
const { cleanOutputDir, createImages } = require("./src/main.js");
const numNfts = myArgs.length > 0 ? Number(myArgs[0]) : defaultNumNfts;

(() => {
  cleanOutputDir();
  createImages(numNfts);
})();

