import api from '../services/api'

export const connectUserToRoom = async (user, id) => {
  try {
    const res = await api.post(`/api/rooms/connectUserToRoom`, {
      user,
      id,
    })
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const addRoomToUsers = async (ids, room) => {
  try {
    const res = await api.post(`/api/rooms/addRoomToUsers`, {
      ids,
      room,
    })
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const getRooms = async (commId, UserId) => {
  try {
    const res = await api.post(`/api/rooms/getRooms`, {
      commId,
      UserId,
    })
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const saveRoom = async (room) => {
  try {
    const res = await api.post(`/api/rooms/saveRoom`, {
      room,
    })
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const getScheduledCallRooms = async (harthId) => {
  try {
    const res = await api.post(`/api/rooms/getScheduledCallRooms`, {
      harthId,
    })
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const deleteScheduledRoom = async (id) => {
  try {
    const res = await api.post(`/api/rooms/deleteScheduledRoom`, {
      id,
    })
    return res.data
  } catch (error) {
    console.log(error)
  }
}
