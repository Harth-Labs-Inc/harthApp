import { connectToDatabase } from '../../../util/mongodb'

export default async (req, res) => {
  let obj
  try {
    obj = JSON.parse(req.body)
  } catch (e) {
    obj = req.body
  }

  const { room } = obj

  const replaceRoom = (db, id, room) => {
    return new Promise((resolve, reject) => {
      let mongo = require('mongodb')
      let o_id = new mongo.ObjectID(id)
      delete room._id
      let newValues = {
        $set: {
          ...room,
        },
      }
      db.collection('rooms').updateOne(
        { _id: o_id },
        newValues,
        function (err, profCreated) {
          if (err) {
            console.log(err)
            resolve(false)
          }
          resolve(true)
        },
      )
    })
  }

  const { db } = await connectToDatabase()

  await replaceRoom(db, room?._id, room)

  return res.json({ msg: 'update successful', ok: 1 })
}
