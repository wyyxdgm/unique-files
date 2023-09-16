
const webdavUrl = "http://192.168.3.100:5240/dav";
const username = "admin";
const password = "12345";
import { AuthType, createClient } from "webdav";

const client = createClient(webdavUrl, {
  username,
  password,
  remoteBasePath: '/baiduyun'
});
(async () => {
  const directoryItems = await client.getDirectoryContents("/baiduyun/我的资源");
  console.log(directoryItems);

})();