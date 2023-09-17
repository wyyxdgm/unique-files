
const webdavUrl = "http://localhost:5240/dav";
const username = "admin";
const password = "12345";
const createClient = require("webdav").createClient;

const client = createClient(webdavUrl, {
  username,
  password,
  remoteBasePath: '/baiduyun'
});
(async () => {
  const directoryItems = await client.getDirectoryContents("/baiduyun/来自：iPhone");
  console.log(directoryItems);
})();