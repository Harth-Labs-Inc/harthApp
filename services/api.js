import Axios from "axios";
import { envUrls } from "../constants/urls";

/* eslint-disable */

const getBaseUrl = () => {
  if (typeof window === "undefined") {
    if (process.env.IS_QA_ENV === "true") {
      return envUrls.qa;
    }
    return envUrls[process.env.NODE_ENV] || envUrls.development;
  }

  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
};

const apiUrl = getBaseUrl();

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
