const fs = require("fs");

/*
** Helper functions
*/
function buildLayerData() {
    let layerData = [];
    const layersDir = `${process.cwd()}/layers/`;
    fs.readdirSync(layersDir).forEach((dir) => {
        layerDir = layersDir + '/' + dir
        layerData.push({name: dir, number: getNumItemsInLayer(layerDir)})
    })
    return layerData
}

if (!process.env.PWD) {
    process.env.PWD = process.cwd();
}

function getNumItemsInLayer(layerDir) {
    return fs.readdirSync(layerDir).length
}

/*
** Configurations
*/
const layerData = buildLayerData();
  
const dimensions = {
    width: 2000,
    height: 2000
};

const defaultNumNfts = 5;
const creatorAddress = "YOUR ADDRESS HERE"

module.exports = { layerData, dimensions, defaultNumNfts, creatorAddress };