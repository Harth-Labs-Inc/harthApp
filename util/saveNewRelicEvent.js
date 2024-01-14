const axios = require("axios");

const sendCustomNewRelicEvent = ({ data, title }) => {
  axios
    .post(process.env.NEW_RELIC_LAMBDA, {
      customEvent: data,
      token: process.env.NEW_RELIC_TOKEN,
      customEventTitle: title,
    })
    .catch((error) => {
      console.error(error);
    });
  return;
};
export default sendCustomNewRelicEvent;
