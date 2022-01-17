import { v4 as uuidv4 } from 'uuid'

export const checkForFolder = (e) => {
  let isFolder = false
  let file
  let length = e.dataTransfer.items.length
  for (let i = 0; i < length; i++) {
    let entry = e.dataTransfer.items[i].webkitGetAsEntry()
    if (entry.isFile) {
      if (i == 0) {
        file = e.dataTransfer.items[i].getAsFile()
      }
    } else if (entry.isDirectory) {
      isFolder = true
    }
  }
  return { file, folder: isFolder }
}

export const checkForBadFile = (file) => {
  let goodFiles = ['png', 'jpg', 'jpeg', 'raw', 'eps', 'gimp', 'heif']
  let isBadFile = true

  if (file) {
    if (!file.name.includes('.') || !file.name.split('.')[1]) {
      return true
    }
    let extention = file.name.split('.').pop()
    goodFiles.forEach((ext) => {
      if (extention && extention.toLowerCase() == ext) {
        isBadFile = false
      }
    })
  }

  return isBadFile
}

export const generateID = () => {
  let id = uuidv4()
  return id
}

export const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const convertToAmPm = (value) => {
  if (value) {
    let [h, m] = value.split(':')
    let time = (h % 12) + 12 * (h % 12 == 0) + ':' + m
    let meridiem = h >= 12 ? ' PM' : ' AM'
    return time + meridiem
  }
  return value
}

export const combineDateTime = (date, time) => {
  let timeArr = time.split(' ')
  let [h, m] = timeArr[0].split(':')
  let mer = timeArr[1]

  if (mer == 'PM' && h !== '12') {
    h = parseInt(h) + 12
  }

  var timeString = h + ':' + m + ':00'
  var datec = date + 'T' + timeString
  var combined = new Date(datec)

  return combined
}
