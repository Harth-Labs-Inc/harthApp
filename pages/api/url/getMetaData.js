export default async (req, res) => {
  let obj
  try {
    obj = JSON.parse(req.body)
  } catch (e) {
    obj = req.body
  }

  const getMeta = (url) => {
    return new Promise((resolve, reject) => {
      const ogs = require('open-graph-scraper')
      const options = {
        url: obj.url,
        headers: {
          'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        },
      }
      ogs(options, (error, results) => {
        if (error) {
          resolve(false)
        }
        resolve(results)
      })
    })
  }

  if (!obj.url) {
    return res.json({ ok: 0, data: {} })
  }
  let data = await getMeta()
  if (!data) {
    return res.json({ ok: 0, data: {} })
  }
  return res.json({ ok: 1, data })
}
