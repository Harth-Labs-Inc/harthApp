import { useEffect, useState } from "react";

import { getURLMetaData } from "../../requests/urls";

import styles from "./ChatSingleMessage.module.scss";

export const LinkPreview = ({ messageID, message }) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  let messageBody = document.getElementById(`message-content${messageID}`);
  let innerHtml = message;

  const [rawURL, setRawURL] = useState();
  const [alteredURL, setAlteredURL] = useState();
  const [ogData, setOgData] = useState();

  const wrapLink = (innerHtml, urlRegex) => {
    let rawurl = "";
    let replacedURL = innerHtml.replace(urlRegex, function (url) {
      rawurl = url;
      if (!url.match("^https?://")) {
        url = "http://" + url;
      }
    });
    setRawURL(rawurl);
    setAlteredURL(replacedURL);
  };

  const promiseTimout = new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, "timeout");
  });
  const getMetaData = async (url) => {
    // console.log("getting meta data");
    // getURLMetaData(url).then((pullResults) => setOgData(pullResults));
    // Promise.race([getURLMetaData(url), promiseTimout]).then((result) => {
    //   console.log(result);
    //   if (result === "timeout") {
    //     console.log("call didnt work");
    //   }
    // });
  };

  useEffect(() => {
    if (urlRegex.test(innerHtml)) {
      wrapLink(innerHtml, urlRegex);
    }
  }, [innerHtml]);

  useEffect(() => {
    if (rawURL) {
      getMetaData(rawURL);
    }
  }, [rawURL]);

  if (setAlteredURL) {
    return <a href={rawURL} target="_blank" rel="noopener noreferrer" />;
  }

  if (ogData) {
    return (
      <article id="ogCard" className={styles.ogCard}>
        <span>{result?.ogTitle}</span>
        <span>{result?.ogDescription}</span>
        <img src={result?.ogImage?.url} alt={result?.ogTitle} loading="lazy" />
      </article>
    );
  }

  return null;
};
