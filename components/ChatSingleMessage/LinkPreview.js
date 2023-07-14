import { useEffect, useState } from "react";
import axios from "axios";
import { getURLMetaData } from "../../requests/urls";
import styles from "./ChatSingleMessage.module.scss";

export const LinkPreview = ({ message }) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  let innerHtml = message;

  const [rawURL, setRawURL] = useState();
  const [alteredURL, setAlteredURL] = useState();
  const [ogData, setOgData] = useState();
  const [linkPreview, setLinkPreview] = useState(null);

  const getHostName = (url) => {
    let hostnameRegex = /^https?:\/\/(?:www\.)?([^/?#]+)(?:[/?#]|$)/i;
    let matches = url.match(hostnameRegex);
    if (matches && matches.length > 1) {
      const hostname = matches[1].toLowerCase();
      if (hostname === "amazon.com") {
        return "amazon";
      } else if (hostname === "twitter.com") {
        return "twitter";
      } else if (hostname === "tiktok.com") {
        return "tiktok";
      } else if (hostname === "youtu.be" || hostname === "youtube.com") {
        return "youtube";
      }
    }

    return null; // or handle the case when no hostname is found or it's not from amazon.com or twitter.com
  };

  const wrapLink = (innerHtml, urlRegex) => {
    let rawurl = "";
    let replacedURL = innerHtml.replace(urlRegex, function (url) {
      rawurl = url;
      return url;
    });

    setRawURL(rawurl);
    setAlteredURL(replacedURL);
  };

  const getMetaData = async (url) => {
    const token = localStorage.getItem("token");
    getURLMetaData(url, token).then(({ data }) => {
      if (data.ok) {
        setOgData(data.data);
      }
    });
  };

  const getLinkPreview = async (url) => {
    try {
      console.log("trying without proxy");
      const responsewithoutProxy = await axios.get(
        `https://opengraph.io/api/1.1/site/${encodeURIComponent(
          url
        )}?accept_lang=auto&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
      );
      console.log(responsewithoutProxy, "responsewithoutProxy");
      if (
        responsewithoutProxy.status == 200 &&
        responsewithoutProxy?.data?.hybridGraph
      ) {
        setLinkPreview(responsewithoutProxy.data.hybridGraph);
      } else {
        const responsewithProxy = await axios.get(
          `https://opengraph.io/api/1.1/site/${encodeURIComponent(
            url
          )}?accept_lang=auto&use_proxy=true&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
        );
        if (
          responsewithProxy.status == 200 &&
          responsewithProxy?.data?.hybridGraph
        ) {
          setLinkPreview(responsewithProxy.data.hybridGraph);
        } else {
          getMetaData(url);
        }
      }
    } catch (error) {
      console.log("made it");
      try {
        console.log("trying with proxy");
        const responsewithProxy = await axios.get(
          `https://opengraph.io/api/1.1/site/${encodeURIComponent(
            url
          )}?accept_lang=auto&use_proxy=true&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
        );
        console.log(responsewithProxy, "responsewithProxy");
        if (
          responsewithProxy.status == 200 &&
          responsewithProxy?.data?.hybridGraph
        ) {
          setLinkPreview(responsewithProxy.data.hybridGraph);
        } else {
          console.log("fallboack");

          getMetaData(url);
        }
      } catch (error) {
        console.log("fallboack");

        getMetaData(url);
      }
    }
  };

  useEffect(() => {
    if (urlRegex.test(innerHtml)) {
      wrapLink(innerHtml, urlRegex);
    }
  }, [innerHtml]);

  useEffect(() => {
    if (rawURL) {
      getLinkPreview(rawURL);
    }
  }, [rawURL]);

  if (
    linkPreview &&
    (linkPreview.title ||
      linkPreview.site_name ||
      linkPreview.description ||
      linkPreview.video ||
      linkPreview.imageSecureUrl ||
      linkPreview.favicon)
  ) {
    if (getHostName(rawURL) === "amazon") {
      return null;
    } else {
      return (
        <>
          <br />
          <article id="ogCard" className={styles.ogCard}>
            <div className={styles.attribution}>
              {getHostName(rawURL) === "tiktok" ? (
                <>
                  <img
                    src="/images/tiktok_logo.png"
                    alt="TikTok Post"
                    loading="lazy"
                  />
                  <p>TikTok</p>
                </>
              ) : (
                <>
                  <img
                    src={linkPreview?.favicon || linkPreview?.image}
                    alt={linkPreview?.title}
                    loading="lazy"
                  />
                  <p>
                    {" "}
                    {getHostName(rawURL) === "youtube"
                      ? "YouTube"
                      : linkPreview?.site_name}
                  </p>
                </>
              )}
            </div>
            <div
              rel="noopener noreferrer"
              onClick={(event) => {
                event.stopPropagation();
                window.open(rawURL, "_blank");
              }}
              style={{
                textDecoration: "none",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              <div className={styles.title}>
                {linkPreview?.title || linkPreview?.site_name}
              </div>
            </div>
            <div className={styles.description}>{linkPreview?.description}</div>
            {linkPreview?.video ? (
              <iframe
                width="100%"
                height="315"
                src={linkPreview?.video}
                title={linkPreview?.title}
                allowFullScreen
              />
            ) : linkPreview?.image ||
              linkPreview?.imageSecureUrl ||
              linkPreview?.favicon ? (
              <img
                src={
                  linkPreview?.image ||
                  linkPreview?.imageSecureUrl ||
                  linkPreview?.favicon
                }
                alt={linkPreview?.title}
                loading="lazy"
              />
            ) : null}
          </article>
        </>
      );
    }
  }

  if (ogData) {
    return (
      <>
        <br />
        <div
          rel="noopener noreferrer"
          onClick={() => window.open(rawURL, "_blank")}
          style={{
            textDecoration: "none",
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          <article id="ogCard" className={styles.ogCard}>
            <div className={styles.attribution}>
              <img
                src={ogData?.result?.favicon}
                alt={ogData?.result?.ogSiteName}
                loading="lazy"
              />
              <p>{ogData?.result?.ogSiteName}</p>
            </div>
            <span className={styles.title}>
              {ogData?.result?.ogTitle || ogData?.result?.ogSiteName}
            </span>
            <span>{ogData?.result?.ogDescription}</span>
            <img
              src={ogData?.result?.ogImage?.url || ogData?.result?.favicon}
              alt={ogData?.result?.ogTitle}
              loading="lazy"
            />
          </article>
        </div>
      </>
    );
  }

  if (rawURL) {
    if (getHostName(rawURL) === "twitter") {
      return null;
    } else {
      return (
        <>
          <article id="ogCard" className={styles.ogCard}>
            <div
              rel="noopener noreferrer"
              onClick={() => window.open(rawURL, "_blank")}
              style={{
                textDecoration: "none",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              {alteredURL}
            </div>
          </article>
        </>
      );
    }
  }

  return null;
};
