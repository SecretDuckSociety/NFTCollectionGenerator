const fs = require("fs");
const { Heap } = require('heap-js');
const metadataJson = require('./output/metadata/metadata.json');
const myArgs = process.argv.slice(2);
const numRares = myArgs.length > 0 ? Number(myArgs[0]) : 1;

let valueCounts = new Map();
let traitCounts = new Map();
let rarities = new Heap((a,b) => a.score - b.score)

function analyze() {
    getCounts();
    calculateProbabilitiesAndTopRares();
}

function getCounts() {
    for (let i = 0; i < metadataJson.length; i++) {
        const imageMetadata = metadataJson[i];
        const attributes = imageMetadata.attributes;
        for (let j = 0; j < attributes.length; j++) {
            const attribute = attributes[j];
            if (!traitCounts.has(attribute.trait_type)) {
                traitCounts.set(attribute.trait_type, 1);
            } else {
                traitCounts.set(attribute.trait_type, traitCounts.get(attribute.trait_type)+1);
            }
            if (!valueCounts.has(attribute.trait_type)) {
                valueCounts.set(attribute.trait_type, new Map());
            }
            let traitValueMap = valueCounts.get(attribute.trait_type);
            if (traitValueMap.has(attribute.value)) {
                traitValueMap.set(attribute.value, traitValueMap.get(attribute.value)+1);
            } else {
                traitValueMap.set(attribute.value, 1);
            }
            valueCounts.set(attribute.trait_type, traitValueMap);
        }
    }
}

function calculateProbabilitiesAndTopRares() {
    let output = {}
    for (const [trait, values] of valueCounts.entries()) {
        output[trait] = {};
        for (const [value, count] of values.entries()) {
            output[trait][value] = `${((count / traitCounts.get(trait)) * 100).toFixed(1)}%`;
        }
    }

    populateRarities(output)
    let topRares = []
    for (let i = 0; i < numRares; i++) {
        topRares.push(rarities.pop().name)
    }
    output['rares'] = topRares;

    fs.writeFile('./probability-analysis.json', JSON.stringify(output, null, 2), (error) => {
        if (error) throw error;
    });
}

function populateRarities(output) {
    for (let i = 0; i < metadataJson.length; i++) {
        const imageMetadata = metadataJson[i];
        const attributes = imageMetadata.attributes;
        let score = 1;
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            score *= Number(output[attribute.trait_type][attribute.value].slice(0, -1)) / 100
        }
        rarities.push({"name": imageMetadata.name, "score": score});
    }
}

(() => {
    analyze();
})();