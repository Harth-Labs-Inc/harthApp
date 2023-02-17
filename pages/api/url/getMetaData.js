export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    console.log(obj);

    const getMeta = (url) => {
        return new Promise((resolve) => {
            const ogs = require("open-graph-scraper");
            const options = {
                url: url,
                headers: {
                    "user-agent":
                        "Googlebot/2.1 (+http://www.google.com/bot.html)",
                },
            };
            ogs(options).then((data) => {
                const { error, result, response } = data;
                if (error) {
                    resolve(false);
                }

                resolve({ result, response: response?.rawBody });
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
};
