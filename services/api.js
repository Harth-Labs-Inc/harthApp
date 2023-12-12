import Axios from "axios";

import { envUrls } from "../constants/urls";
import { getBaseUrl } from "./helper";

const URLS = envUrls;

/* eslint-disable */

const dynamicBaseUrl = getBaseUrl();
const apiUrl = dynamicBaseUrl || URLS.development;

console.log(dynamicBaseUrl, "dynamicBaseUrl");

const api = Axios.create({
  baseURL: apiUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  },
});
export default api;
