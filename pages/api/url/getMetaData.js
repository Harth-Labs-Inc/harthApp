export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    /* eslint-disable */

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
            Promise.race([ogs(options), promiseTimout]).then((data) => {
                const { error, result } = data;
                if (error === false) {
                    resolve({ result });
                    // resolve({ result, response: response?.rawBody });
                } else {
                    Promise.race([ogs(options), promiseTimoutShort]).then(
                        (data) => {
                            const { error, result } = data;
                            if (error === false) {
                                resolve({ result });
                                // resolve({ result, response: response?.rawBody });
                            } else {
                                resolve(false);
                            }
                        }
                    );
                }
            });
        });
    };

    if (!obj.url) {
        return res.json({ ok: 0, data: {} });
    }

    let data = await getMeta(obj.url);
    if (!data) {
        return res.json({ ok: 0, data: {} });
    }
    return res.json({ ok: 1, data });

    // if (obj.url.includes("www.instagram.com")) {
    //     let data = await getMeta(obj.url);
    //     if (!data) {
    //         return res.json({ ok: 0, data: {} });
    //     }
    //     return res.json({ ok: 1, data });
    // } else {
    //     return res.json({ ok: 0, data: {} });
    // }
};
