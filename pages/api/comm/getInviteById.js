import { connectToDatabase } from '../../../util/mongodb'

export default async (req, res) => {
  let obj
  try {
    obj = JSON.parse(req.body)
  } catch (e) {
    obj = req.body
  }

  const getInvite = (db, id) => {
    return new Promise((resolve, reject) => {
      db.collection('invites')
        .find({ comm_id: id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false)
          }
          if (results[0]) {
            if (new Date() < new Date(results[0].expiration)) {
              resolve(results[0])
            } else {
              resolve(false)
            }
          } else {
            resolve(false)
          }
        })
    })
  }

  const { db } = await connectToDatabase()
  let fetchResults = await getInvite(db, obj.id)
  if (!fetchResults) {
    return res.json({ msg: 'Something Went Wrong', ok: 0 })
  }
  return res.json({ msg: 'successful', ok: 1, invite: fetchResults })
}
