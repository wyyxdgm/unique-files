const fs = require('fs');

const { filteredJsonFilePath, duplicateJsonFilePath } = require('./dav-var')


// 读取a.json文件内容
fs.readFile(filteredJsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const fileData = JSON.parse(data);

    // 使用Map来存储文件大小和文件名的组合及对应的文件路径数组
    const duplicateFilesMap = new Map();

    // 遍历文件数据，查找重复的文件路径
    fileData.forEach((fileInfo) => {
      const fileName = fileInfo.basename;
      const fileSize = fileInfo.size;
      const filePath = fileInfo.filename;
      const fileKey = `${fileName}-${fileSize}`;

      if (duplicateFilesMap.has(fileKey)) {
        // 存在相同的文件大小和名称组合，则将文件路径添加到已有的数组中
        const filePaths = duplicateFilesMap.get(fileKey);
        filePaths.push(filePath);
      } else {
        // 新的文件大小和名称组合，创建新的文件路径数组
        duplicateFilesMap.set(fileKey, [filePath]);
      }
    });

    // 过滤出重复文件路径大于1的组合
    const duplicateFilePaths = Array.from(duplicateFilesMap.entries())
      .filter(([_, filePaths]) => filePaths.length > 1)
      .map(([_, filePaths]) => filePaths);

    console.log('Duplicate file paths:');
    console.log(duplicateFilePaths);

    // 将重复文件路径输出到b.json文件
    const outputData = JSON.stringify(duplicateFilePaths, null, 2);
    fs.writeFile(duplicateJsonFilePath, outputData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('Duplicate file paths saved to b.json');
      }
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});