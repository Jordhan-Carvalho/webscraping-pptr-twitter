const twt = require("./twitter");
const utils = require("./utils");

(async () => {
  // const resp = await utils.getUserData();

  await twt.initialize();

  // await twt.login(resp.name, resp.password);

  // await twt.post("Web scraping with puppeteer testing");

  // const userDetails = await twt.getUser("udemy");

  // const tweets = await twt.getTweets("jordhanpc", 50);

  // await twt.end();
})();
