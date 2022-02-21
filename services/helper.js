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

export function getObjectFromUrl(url) {
  if (!url) url = location.search
  let result = null
  if (url?.length) {
    result = {}
    let query = url.substr(1)
    query.split('&').forEach(function (part) {
      let item = part.split('=')
      result[item[0]] = decodeURIComponent(item[1])
    })
  }
  return result
}

export function getMessageDateOrTime(date = null) {
  if (date !== null) {
    const dateObj = new Date(date)
    const dateDetails = {
      date: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      hour: dateObj.getHours(),
      minutes: dateObj.getMinutes(),
    }
    const currentDateObj = new Date()
    const currentDateDetails = {
      date: currentDateObj.getDate(),
      month: currentDateObj.getMonth() + 1,
      year: currentDateObj.getFullYear(),
      hour: currentDateObj.getHours(),
      minutes: currentDateObj.getMinutes(),
    }
    if (
      dateDetails.year !== currentDateDetails.year &&
      dateDetails.month !== currentDateDetails.month &&
      dateDetails.date !== currentDateDetails.date
    ) {
      return dateDetails.date + '-' + dateDetails.month + '-' + dateDetails.year
    } else {
      return (
        dateDetails.hour +
        ':' +
        dateDetails.minutes +
        ` ${dateDetails.hour < 12 ? 'AM' : 'PM'}`
      )
    }
  }
  return ''
}

export function ellapsedTime(date1) {
  /*
   * calcDate() : Calculates the difference between two dates
   * @date1 : "First Date in the format M-D-Y"
   * @date2 : "Second Date in the format M-D-Y"
   * return : Array
   */
  //Initiate date object
  // const dt_date1 = new Date(date1)
  const currentDate = new Date()
  const startDate = new Date(date1)
  console.log(currentDate, startDate)
  //Get the Timestamp
  var stateTime = startDate.getTime()
  var currentTime = currentDate.getTime()
  console.log(stateTime, currentTime)
  let calc
  //Check which timestamp is greater
  if (stateTime > currentTime) {
    calc = new Date(stateTime - currentTime)
  } else {
    calc = new Date(currentTime - stateTime)
  }

  //Retrieve the date, month and year
  var calcFormatTmp =
    calc.getMinutes() +
    '-' +
    calc.getHours() +
    '-' +
    calc.getDate() +
    '-' +
    (calc.getMonth() + 1) +
    '-' +
    calc.getFullYear()
  //Convert to an array and store
  var calcFormat = calcFormatTmp.split('-')
  //Subtract each member of our array from the default date
  const minutes_passed = parseInt(Math.abs(calcFormat[0]) - 1)
  const hours_passed = parseInt(Math.abs(calcFormat[1]) - 1)
  const days_passed = parseInt(Math.abs(calcFormat[2]) - 1)
  const months_passed = parseInt(Math.abs(calcFormat[3]) - 1)
  const years_passed = parseInt(Math.abs(calcFormat[4] - 1970))

  //Set up custom text
  const yrsTxt = ['year', 'years']
  const mnthsTxt = ['month', 'months']
  const daysTxt = ['day', 'days']
  const hoursTxt = ['hour', 'hours']
  const minutesTxt = ['minute', 'minutes']

  //Convert to days and sum together
  var total_days = years_passed * 365 + months_passed * 30.417 + days_passed

  //display result with custom text
  const result =
    (years_passed == 1
      ? years_passed + ' ' + yrsTxt[0] + ' '
      : years_passed > 1
      ? years_passed + ' ' + yrsTxt[1] + ' '
      : '') +
    (months_passed == 1
      ? months_passed + ' ' + mnthsTxt[0]
      : months_passed > 1
      ? months_passed + ' ' + mnthsTxt[1] + ' '
      : '') +
    (days_passed == 1
      ? days_passed + ' ' + daysTxt[0]
      : days_passed > 1
      ? days_passed + ' ' + daysTxt[1] + ' '
      : '') +
    (hours_passed == 1
      ? hours_passed + ' ' + hoursTxt[0]
      : hours_passed > 1
      ? hours_passed + ' ' + hoursTxt[1] + ' '
      : '') +
    (minutes_passed == 1
      ? minutes_passed + ' ' + minutesTxt[0]
      : minutes_passed > 1
      ? minutes_passed + ' ' + minutesTxt[1]
      : '')

  console.log(result)

  return result
}
