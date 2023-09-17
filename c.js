import fs from "fs";

const inputFilePath = path.join(__dirname, './storage/b.json');
const outputFilePath = path.join(__dirname, './storage/c.json');

function removeFirstItemFromArray(arr) {
  return arr.slice(1);
}

const duplicateFiles = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
const filesToRemove = duplicateFiles.map(files => removeFirstItemFromArray(files));
fs.writeFileSync(outputFilePath, JSON.stringify(filesToRemove, null, 2));