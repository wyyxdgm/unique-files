const fs = require('fs');

const inputFilePath = './storage/c.json';
const deleteFilePath = './storage/d.json';


const filesToRemove = JSON.parse(fs.readFileSync(inputFilePath, 'utf8')).flat();
filesToRemove.forEach(filePath => {
  fs.unlinkSync(filePath);
});

function deleteFolders(deleteList) {
  for (const folder of deleteList) {
    try {
      fs.rmdirSync(folder, { recursive: true });
      console.log(`Deleted folder: ${folder}`);
    } catch (err) {
      console.error(`Error deleting folder: ${folder}`, err);
    }
  }
}

try {
  const deleteList = JSON.parse(fs.readFileSync(deleteFilePath, 'utf8'));
  deleteFolders(deleteList);
} catch (err) {
  console.error(err);
}