const fs = require("fs");
const metadataJson = require('./output/metadata/metadata.json');
const myArgs = process.argv.slice(2);

let output = [];
let traitsToFind = [];

function parseArgs() {
    for (let i = 0; i < myArgs.length; i++) {
        const splitIndex = myArgs[i].indexOf(":");
        const trait_type = myArgs[i].substring(0, splitIndex)
        const value = myArgs[i].substring(splitIndex+1);
        traitsToFind.push({trait_type: trait_type, value: value});
    }
}

function contains(trait, attributes) {
    for (let i = 0; i < attributes.length; i++) {
        if (trait.trait_type === attributes[i].trait_type) {
            return trait.value === attributes[i].value;
        }
    }
}

function search() {
    parseArgs();

    for (let i = 0; i < metadataJson.length; i++) {
        let toPush = true;
        const imageMetadata = metadataJson[i];
        const attributes = imageMetadata.attributes;
        for (let j = 0; j < traitsToFind.length; j++) {
            const traitToFind = traitsToFind[j];
            if (!contains(traitToFind, attributes)) {
                toPush = false;
                break;
            }
        }
        if (toPush) {
            output.push(imageMetadata.image.slice(0, -4));
        }
    }
    console.log(output)
}

(() => {
    search();
})();
