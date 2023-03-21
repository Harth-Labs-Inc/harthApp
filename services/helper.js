import { v4 as uuidv4 } from "uuid";
import { getUploadURL, putImageInBucket } from "../requests/s3";

export const generateOTP = () => {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

export const checkForFolder = (e) => {
  let isFolder = false;
  let file;
  let length = e.dataTransfer.items.length;
  for (let i = 0; i < length; i++) {
    let entry = e.dataTransfer.items[i].webkitGetAsEntry();
    if (entry.isFile) {
      if (i == 0) {
        file = e.dataTransfer.items[i].getAsFile();
      }
    } else if (entry.isDirectory) {
      isFolder = true;
    }
  }
  return { file, folder: isFolder };
};

export const checkForBadFile = (file) => {
  let goodFiles = ["png", "jpg", "jpeg", "raw", "eps", "gimp", "heif"];
  let isBadFile = true;

  if (file) {
    if (!file.name.includes(".") || !file.name.split(".")[1]) {
      return true;
    }
    let extention = file.name.split(".").pop();
    goodFiles.forEach((ext) => {
      if (extention && extention.toLowerCase() == ext) {
        isBadFile = false;
      }
    });
  }

  return isBadFile;
};

export const generateID = () => {
  let id = uuidv4();
  return id;
};

export const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const convertToAmPm = (value) => {
  if (value) {
    let [h, m] = value.split(":");
    let time = (h % 12) + 12 * (h % 12 == 0) + ":" + m;
    let meridiem = h >= 12 ? " PM" : " AM";
    return time + meridiem;
  }
  return value;
};

export const combineDateTime = (date, time) => {
  let pad = (s) => {
    return s < 10 ? "0" + s : s;
  };

  let timeArr = time.split(" ");
  let [h, m] = timeArr[0].split(":");
  let mer = timeArr[1];

  if (mer == "PM" && h !== "12") {
    h = parseInt(h) + 12;
  }

  var timeString = pad(h) + ":" + m + ":00";
  var datec = date + "T" + timeString;
  var combined = new Date(datec);
  return combined;
};

export function getObjectFromUrl(url) {
  if (!url) url = location.search;
  let result = null;
  if (url?.length) {
    result = {};
    let query = url.substr(1);
    query.split("&").forEach(function (part) {
      let item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
  }
  return result;
}

export function getMessageDateOrTime(date = null) {
  if (date !== null) {
    const dateObj = new Date(date);
    const dateDetails = {
      date: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      hour: dateObj.getHours(),
      minutes: dateObj.getMinutes(),
    };
    const currentDateObj = new Date();
    const currentDateDetails = {
      date: currentDateObj.getDate(),
      month: currentDateObj.getMonth() + 1,
      year: currentDateObj.getFullYear(),
      hour: currentDateObj.getHours(),
      minutes: currentDateObj.getMinutes(),
    };
    if (
      dateDetails.year !== currentDateDetails.year &&
      dateDetails.month !== currentDateDetails.month &&
      dateDetails.date !== currentDateDetails.date
    ) {
      return (
        dateDetails.date + "-" + dateDetails.month + "-" + dateDetails.year
      );
    } else {
      return (
        dateDetails.hour +
        ":" +
        dateDetails.minutes +
        ` ${dateDetails.hour < 12 ? "AM" : "PM"}`
      );
    }
  }
  return "";
}

export function ellapsedTime(date1) {
  const currentDate = new Date();
  const startDate = new Date(date1);

  // //Get the Timestamp
  var stateTime = startDate.getTime();
  var currentTime = currentDate.getTime();

  let calc;
  //Check which timestamp is greater
  if (stateTime > currentTime) {
    calc = new Date(stateTime - currentTime) / 1000;
  } else {
    calc = new Date(currentTime - stateTime) / 1000;
  }

  // calculate (and subtract) whole days
  const days_passed = Math.floor(calc / 86400);
  calc -= days_passed * 86400;

  // calculate (and subtract) whole hours
  const hours_passed = Math.floor(calc / 3600) % 24;
  calc -= hours_passed * 3600;

  // calculate (and subtract) whole minutes
  const minutes_passed = Math.floor(calc / 60) % 60;
  calc -= minutes_passed * 60;

  //display result with custom text
  const result =
    (days_passed > 0 ? days_passed + "d" + " " : "") +
    (hours_passed > 0 ? hours_passed + "h" + " " : "") +
    (minutes_passed > 0 ? minutes_passed + "m" : "");

  return result;
}

export function convertToMilitaryTime(time) {
  try {
    let hours = Number(time.match(/^(\d+)/)[1]);
    let minutes = Number(time.match(/:(\d+)/)[1]);
    const AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM.toLowerCase() === "pm" && hours < 12) hours = hours + 12;
    if (AMPM.toLowerCase() === "am" && hours == 12) hours = hours - 12;

    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;

    return `${sHours}:${sMinutes}`;
  } catch (error) {
    return time;
  }
}

export function uploadFile({ file, bucket }) {
  return new Promise((resolve) => {
    if (!file || !bucket) {
      resolve({ ok: 0 });
    }
    async function upload() {
      let extention = file.name.split(".").pop();
      let id = generateID();
      let name = `${id}_${file.name.split(".")[0]}.${extention}`;
      const data = await getUploadURL(name, file.type, bucket);
      const { ok, uploadURL } = data;
      if (ok) {
        let reader = new FileReader();
        reader.addEventListener("loadend", async () => {
          let result = await putImageInBucket(uploadURL, reader, file.type);
          let { status } = result;
          if (status == 200) {
            resolve({ ok: 1, name });
          } else {
            resolve({ ok: 0 });
          }
        });
        reader.readAsArrayBuffer(file);
      } else {
        resolve({ ok: 0 });
      }
    }
    upload();
  });
}

export function uploadCustomNamedFile({ file, bucket, name }) {
  return new Promise((resolve) => {
    if (!file || !bucket || !name) {
      resolve({ ok: 0 });
    }
    async function upload() {
      let extention = file.name.split(".").pop();
      let newName = `${name}.${extention}`;
      const data = await getUploadURL(newName, file.type, bucket);
      const { ok, uploadURL } = data;
      if (ok) {
        let reader = new FileReader();
        reader.addEventListener("loadend", async () => {
          let result = await putImageInBucket(uploadURL, reader, file.type);
          let { status } = result;
          if (status == 200) {
            resolve({ ok: 1, name: newName });
          } else {
            resolve({ ok: 0 });
          }
        });
        reader.readAsArrayBuffer(file);
      } else {
        resolve({ ok: 0 });
      }
    }
    upload();
  });
}
