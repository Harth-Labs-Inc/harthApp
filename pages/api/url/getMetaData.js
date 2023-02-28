export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const promiseTimout = new Promise((resolve, reject) => {
    setTimeout(resolve, 4000, "timeout");
  });
  const promiseTimoutShort = new Promise((resolve, reject) => {
    setTimeout(resolve, 2000, "timeout");
  });

  const getMeta = (url) => {
    return new Promise(async (resolve) => {
      const ogs = require("open-graph-scraper");
      const options = {
        url: url,
        headers: {},
      };
      console.log("url", url);
      console.log("starting first try...");
      Promise.race([ogs(options), promiseTimout]).then((data) => {
        const { error, result } = data;
        if (error === false) {
          console.log("first try worked");
          resolve({ result });
          // resolve({ result, response: response?.rawBody });
        } else {
          console.log("first try failed");
          console.log("starting second try...");
          Promise.race([ogs(options), promiseTimoutShort]).then((data) => {
            const { error, result } = data;
            if (error === false) {
              console.log("second try worked");
              resolve({ result });
              // resolve({ result, response: response?.rawBody });
            } else {
              console.log("second try failed");
              resolve(false);
            }
          });
        }
      });
    });
  };

  if (!obj.url) {
    return res.json({ ok: 0, data: {} });
  }

  if (obj.url.includes("www.instagram.com")) {
    let data = await getMeta(obj.url);
    if (!data) {
      return res.json({ ok: 0, data: {} });
    }
    return res.json({ ok: 1, data });
  } else {
    return res.json({ ok: 0, data: {} });
  }
};
