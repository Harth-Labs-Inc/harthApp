import { connectToDatabase } from '../../../util/mongodb'

export default async (req, res) => {
  let obj
  try {
    obj = JSON.parse(req.body)
  } catch (e) {
    obj = req.body
  }

  const pushUserToComm = (db, id, data) => {
    return new Promise((resolve, reject) => {
      let mongo = require('mongodb')
      let o_id = new mongo.ObjectID(id)
      db.collection('communities').updateOne(
        { _id: o_id },
        { $push: { users: data } },
        function (err, results) {
          if (err) {
            resolve(false)
          }
          resolve(results)
        },
      )
    })
  }

  const pushCommToUser = (db, userId, commId) => {
    return new Promise((resolve, reject) => {
      let mongo = require('mongodb')
      let o_id = new mongo.ObjectID(userId)
      db.collection('users').updateOne(
        { _id: o_id },
        { $push: { comms: commId } },
        function (err, results) {
          if (err) {
            resolve(false)
          }
          resolve(results)
        },
      )
    })
  }

  const getPublicTopicsForComm = (db, commId) => {
    return new Promise((resolve, reject) => {
      db.collection('topics')
        .find({ comm_id: commId, private: { $eq: false } })
        .toArray(function (err, results) {
          if (err) {
            console.log(err)
            resolve(false)
          }
          console.log('getPublicTopicsForComm')
          resolve(results)
        })
    })
  }

  const addRoomsToUser = (db, userId, ids) => {
    return new Promise((resolve, reject) => {
      let mongo = require('mongodb')
      let o_id = new mongo.ObjectID(userId)
      db.collection('users').updateOne(
        { _id: o_id },
        { $push: { rooms: { $each: ids } } },
        function (err, results) {
          if (err) {
            resolve(false)
          }
          console.log('addRoomsToUser')
          resolve(results)
        },
      )
    })
  }

  const addMemberToTopics = (db, user, ids) => {
    return new Promise((resolve, reject) => {
      let mongo = require('mongodb')
      let objIds = []
      ids.forEach((id) => {
        let o_id = new mongo.ObjectID(id)
        objIds.push(o_id)
      })

      let memberObj = {
        ...user,
        user_id: user.userId,
        admin: false,
        muted: false,
      }

      db.collection('topics').updateMany(
        { _id: { $in: objIds } },
        { $push: { members: memberObj } },
        function (err, results) {
          if (err) {
            resolve(false)
          }
          console.log('addMemberToTopics')
          resolve(results)
        },
      )
    })
  }

  const { db } = await connectToDatabase()
  ///////////
  let getProfResult = await pushUserToComm(db, obj.id, obj.prof)
  console.log(1)
  if (!getProfResult) {
    return res.json({ ok: 0, msg: 'something went wrong' })
  }
  console.log(2)

  let getuserResult = await pushCommToUser(db, obj.prof.userId, obj.id)
  console.log(3)

  if (!getuserResult) {
    return res.json({ ok: 0, msg: 'something went wrong' })
  }
  console.log(4)

  if (!getuserResult.modifiedCount) {
    return res.json({ ok: 0, msg: 'something went wrong' })
  }
  console.log(5)

  //////////
  let topics = await getPublicTopicsForComm(db, obj.id)
  console.log(6)

  if (!topics) {
    return res.json({ ok: 0, msg: 'something went wrong' })
  }
  //////////
  let topicIds = topics.map((topic) => topic._id.toString())
  await addRoomsToUser(db, obj.prof.userId, topicIds)
  await addMemberToTopics(db, obj.prof, topicIds)

  return res.json({ ok: 1, msg: 'success' })
}
