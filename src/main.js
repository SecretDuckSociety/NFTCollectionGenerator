const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const console = require("console");
const { layerData, dimensions, creatorAddress } = require("./settings.js");
const canvas = createCanvas(dimensions.width, dimensions.height);
const ctx = canvas.getContext("2d");

const outputDir = `${process.cwd()}/output`;
const metadataOutputDir = `${outputDir}/metadata`;
const imageOutputDir = `${outputDir}/images`;
const metadataFile = 'metadata.json';
const layersDir = `${process.cwd()}/layers`;

let metadata = [];

function cleanOutputDir() {
  if (fs.existsSync(metadataOutputDir)) {
    fs.rmdirSync(metadataOutputDir, { recursive: true });
  }
  fs.mkdirSync(metadataOutputDir);
  if (fs.existsSync(imageOutputDir)) {
    fs.rmdirSync(imageOutputDir, { recursive: true });
  }
  fs.mkdirSync(imageOutputDir);
}

async function createImages(numImages) {
  const layers = buildLayers(layerData);
  const hashes = generateImageHashes(layers, numImages);
  
  for (let i = 0; i < hashes.length; i++) {
    await drawImage(hashes[i], layers, i);
  }
  createMetadataFile();
}

async function drawImage(hash, layers, imageNum) {
  for (let i = 0; j < layers.length; i=i+2, j++) {
    const layer = layers[j];
    let element;
    let id_num = Number(hash.substring(i, i+2));
    element = getLayerElement(layer, id_num);
    attributes.push({"trait_type": layer.name.slice(layer.name.indexOf('_')+1), "value": element.name})
    const asset = await loadImage(`${layer.location}${element.fileName}`);
    ctx.drawImage(asset, layer.position.x, layer.position.y, layer.size.width, layer.size.height);
  }
  saveImageMetadata(imageNum, attributes);
  saveImage(canvas, imageNum);
}

function saveImageMetadata(imageNum, attributes) {
  const imageMetadata = {
    name: `Duck #${imageNum}`,
    symbol: "",
    description: "A member of the Secret Duck Society",
    seller_fee_basis_points: 500, // 100 = 1%
    image: `${imageNum}.png`,
    external_url: "https://secretducksociety.com",
    attributes: attributes,
    collection: {
      name: "Secret Duck Society",
      family: "Secret Society"
    },
    properties: {
      files: [
        {
          uri: `${imageNum}.png`,
          type: "image/png"
        }
      ],
      category: "image",
      creators: [
        {
          address: creatorAddress,
          share: 100
        }
      ]
    }
  };
  metadata.push(imageMetadata);
  fs.writeFileSync(`${metadataOutputDir}/${imageNum}.json`, JSON.stringify(imageMetadata, null, 2));
}

function getLayerElement(layer, id_num) {
  const id = indexWrapper(id_num)
  let elementToReturn;
  layer.elements.forEach((element) => {
    if (element.id === id) elementToReturn = element;
  })
  if (elementToReturn == null)
    throw new Error(`Couldn't find element with id ${id} in layer ${layer.name}`);
  return elementToReturn;
}

function saveImage(canvas, imageNum) {
  fs.writeFileSync(`${imageOutputDir}/${imageNum}.png`, canvas.toBuffer("image/png"));
}

function generateImageHashes(layers, numImages) {
  let hashes = [];
  for (let i = 0; i < numImages; i++) {
    let hash = generateNewImageHash(layers);
    if (hashes.includes(hash)) {
      i--;
      continue;
    }
    hashes.push(generateNewImageHash(layers));
  }
  return hashes;
}

function generateNewImageHash(layers) {
  let hash = [];
  layers.forEach((layer) => {
    hash.push(pickRandomElementByWeight(layer.elements));
  })
  return hash.join("");
}

function pickRandomElementByWeight(elements) {
  var i;

  // Sort the elements by decreasing rarity
  elements.sort((a, b) => b.rarity - a.rarity);

  // Initialize a weights array with the cumulative rarity of each element
  let weights = new Array();
  for (i = 0; i < elements.length; i++) {
    weights[i] = elements[i].rarity + (weights[i-1] || 0)
  }

  const randNum = Math.floor(Math.random() * weights[weights.length - 1]);

  // If the random number falls in the rarity range of an element, return that element
  for (i = 0; i < weights.length; i++) {
    if (weights[i] > randNum) break;
  }
  return elements[i].id;
}

function createMetadataFile() {
  fs.stat(`${outputDir}/${metadataFile}`, (err) => {
    if(err == null || err.code === 'ENOENT') {
      fs.writeFileSync(`${metadataOutputDir}/${metadataFile}`, JSON.stringify(metadata, null, 2));
    } else {
        console.log('Oh no, error: ', err.code);
    }
  });
}

function buildLayers(layerData) {
  const layers = layerData.map((layer, index) => ({
    id: index,
    name: layer.name,
    location: `${layersDir}/${layer.name}/`,
    elements: getElementsInLayer(`${layersDir}/${layer.name}/`),
    position: { x: 0, y: 0 },
    size: { width: dimensions.width, height: dimensions.height },
    number: layer.number
  }));

  return layers;
}

function getElementsInLayer(path) {
  return fs.readdirSync(path)
          .filter((fileName) => !/(^|\/)\.[^\/\.]/g.test(fileName))
          .map((fileName, index) => {
            return {
              id: indexWrapper(index),
              name: cleanFileName(fileName),
              fileName: fileName,
              rarity: getRarityFromFileName(fileName),
            };
          });
}

function indexWrapper(index) {
  if (index < 10)
    return "0" + index.toString();
  else {
    return index.toString();
  }
}

function cleanFileName(fileName) {
  const cleanedName = fileName.slice(0, -4); // remove '.png'
  const index = fileName.search(/\d/);
  return cleanedName.slice(0, index - 1) // remove rarity percentage
}

function getRarityFromFileName(fileName) {
  const cleanedName = fileName.slice(0, -4); // remove '.png'
  const index = cleanedName.search(/\d/);
  return Number(cleanedName.slice(index));
}

module.exports = { cleanOutputDir, createImages };
