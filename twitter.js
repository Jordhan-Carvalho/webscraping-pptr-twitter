const puppeteer = require("puppeteer");

const BASE_URL = "https://twitter.com/";
let browser = null;
let page = null;

const twitter = {
  initialize: async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();

    await page.goto(BASE_URL);
  },

  login: async (username, password) => {
    await page.click('a[href="/login"]', { delay: 150 });
    await page.waitFor(1560);
    await page.type('input[name="session[username_or_email]', username, {
      delay: 112
    });
    await page.type(
      "#page-container > div > div.signin-wrapper > form > fieldset > div:nth-child(3) > input",
      password,
      {
        delay: 126
      }
    );
    await page.keyboard.press("Enter");
    await page.waitFor('div[name="tweet"]');
    await page.waitFor(220);
  },

  post: async text => {
    const url = await page.url();
    if (url != BASE_URL) {
      await page.goto(BASE_URL);
    }
    await page.waitFor(517);
    await page.type('div[name="tweet"]', text, { delay: 57 });
    await page.click(
      "#timeline > div.timeline-tweet-box > div > form > div.TweetBoxToolbar > div.TweetBoxToolbar-tweetButton.tweet-button > button",
      { delay: 25 }
    );
  },

  getUser: async username => {
    const url = await page.url();
    if (url != `${BASE_URL}${username}`) {
      await page.goto(`${BASE_URL}${username}`);
    }

    await page.waitFor(1150);

    const userInfo = await page.evaluate(() => {
      const getInnerText = selector => {
        return document.querySelector(selector)
          ? document.querySelector(selector).textContent.trim()
          : false;
      };

      const getTextAtt = (selector, attribute) => {
        return document.querySelector(selector)
          ? document.querySelector(selector).getAttribute(attribute)
          : false;
      };

      return {
        displayName: getInnerText('h1[class="ProfileHeaderCard-name"] > a'),

        location: getInnerText(
          'div[class="ProfileHeaderCard-location "] > span:nth-child(2)'
        ),

        isVerified: document.querySelector(
          'span[class="ProfileHeaderCard-badges"] > a > span[class="Icon Icon--verified"]'
        )
          ? true
          : false,

        website: getInnerText(
          'div[class="ProfileHeaderCard-url "] > span:nth-child(2)'
        ),

        description: getInnerText('p[class="ProfileHeaderCard-bio u-dir"]'),

        following: getTextAtt(
          'ul[class="ProfileNav-list"] > li > a[data-nav="following"] > span[class="ProfileNav-value"]',
          "data-count"
        ),

        followers: getTextAtt(
          'ul[class="ProfileNav-list"] > li > a[data-nav="followers"] > span[class="ProfileNav-value"]',
          "data-count"
        ),

        likes: getTextAtt(
          'ul[class="ProfileNav-list"] > li > a[data-nav="favorites"] > span[class="ProfileNav-value"]',
          "data-count"
        ),

        twtNumber: getTextAtt(
          'ul[class="ProfileNav-list"] > li > a[data-nav="tweets"] > span[class="ProfileNav-value"]',
          "data-count"
        )
      };
    });

    return userInfo;
  },

  getTweets: async (username, count = 5) => {
    const url = await page.url();
    if (url != `${BASE_URL}${username}`) {
      await page.goto(`${BASE_URL}${username}`);
    }

    await page.waitFor(1150);
    await page.waitFor("#stream-items-id");

    let tweetsArray = await page.$$("#stream-items-id > li");
    //Scroll to form new array
    let lastTwtArrayLength = 0;
    for (let i = 0; tweetsArray.length < count; i++) {
      await page.evaluate(`window.scrollTo(0,document.body.scrollHeight)`);
      await page.waitFor(3020);
      tweetsArray = await page.$$("#stream-items-id > li");
      if (lastTwtArrayLength == tweetsArray.length) break;
      lastTwtArrayLength = tweetsArray.length;
    }

    let tweets = [];
    for (let twtEl of tweetsArray) {
      const twtText = await twtEl.$eval(
        'div[class="js-tweet-text-container"]',
        el => el.textContent.trim()
      );
      const twtDate = await twtEl.$eval(
        'a[class="tweet-timestamp js-permalink js-nav js-tooltip"]',
        el => el.getAttribute("title")
      );
      const twtComments = await twtEl.$eval(
        'button[data-modal="ProfileTweet-reply"] span[class="ProfileTweet-actionCountForPresentation"]',
        el => el.textContent
      );
      const retwts = await twtEl.$eval(
        'button[data-modal="ProfileTweet-retweet"] span[class="ProfileTweet-actionCountForPresentation"]',
        el => el.textContent
      );
      const twtLikes = await twtEl.$eval(
        'button[class="ProfileTweet-actionButton js-actionButton js-actionFavorite"] span[class="ProfileTweet-actionCountForPresentation"]',
        el => el.textContent
      );

      const tweet = { twtDate, twtComments, retwts, twtLikes, twtText };
      tweets.push(tweet);
    }

    //Make the new array with the number of count
    return tweets.slice(0, count);
  },

  end: async () => {
    await browser.close();
  }
};

module.exports = twitter;
