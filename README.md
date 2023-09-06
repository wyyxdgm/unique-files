# unique files

去除重复文件

- a.js：遍历文件夹，将文件地址和文件大小存储到 a.json。
- b.js：解析 a.json，将重名且文件大小一致的文件地址放到同一个数组中，并写入 b.json。
- c.js：从 b.json 中提取重名文件的其他项数据，存入 c.json。
- d.js：从 c.json 中读取要删除的文件地址，并删除这些文件。

请注意，在每个脚本中，你需要根据实际的文件夹路径和文件名来设置正确的输入和输出文件路径。

## 使用

1. 调整 `a.js` 中的 folderPath(目标目录)和 delayInSeconds(读取到目录后延迟时间读取)

```js
const folderPath = "./folder";
const outputFilePath = "a.json";
const delayInSeconds = 3; // 设置延迟的秒数
```

2. 执行任务

- 建议方式-一步一步执行和确认对应生成的 json 文件

```bash
node a.js
node b.js
node c.js
# node d.js # 根据c.json删除文件
```

- 不建议方式-请明确脚本执行内容再这么做

```bash
./run_scripts.sh > script.log # 执行读取和删除（慎重执行），并输出日志到script.log
tail -f script.log # 查看日志
```
