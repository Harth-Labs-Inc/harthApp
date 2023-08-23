import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ChatSingleMessage.module.scss";
import Placeholder from "components/Common/placeholder/placeholder";
import {
  fetchImage,
  getAttachment,
  openDB,
  saveAttachment,
} from "services/helper";
import { getURLMetaData } from "requests/urls";

const DB_NAME = "LinkPreviewCache";
const STORE_NAME = "previews";

const sanitizeURL = (url) => {
  return url.replace(/[^a-zA-Z0-9]/g, "_");
};

const cacheData = async (url, data) => {
  const sanitizedURL = sanitizeURL(url);
  const db = await openDB(DB_NAME, STORE_NAME);
  saveAttachment(db, STORE_NAME, sanitizedURL, data);
};

const getCachedData = async (url) => {
  const sanitizedURL = sanitizeURL(url);
  const db = await openDB(DB_NAME, STORE_NAME);
  return getAttachment(db, STORE_NAME, sanitizedURL);
};

export const LinkPreview = ({ message }) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const [linkData, setLinkData] = useState(null);
  const blacklist = new Set([
    "twitter.com",
    "instagram.com",
    "amazon.com",
    "x.com",
  ]);

  const isBlacklisted = (url) => {
    for (let domain of blacklist) {
      if (url.includes(domain)) {
        return true;
      }
    }

    return false;
  };

  const renderPlaceholder = () => {
    return <Placeholder />;
  };

  const renderLinkPreview = () => {
    const { title, site_name, description, video, image, favicon } = linkData;
    if (title == "GIF Image") {
      return (
        <>
          <article
            id="ogCard"
            className={styles.ogCard}
            onTouchStart={(event) => event.stopPropagation()}
            onTouchEnd={(event) => event.stopPropagation()}
          >
            {!video && !image && !favicon ? null : (
              <div style={{ height: "100%" }} className={styles.imageholder}>
                {image ? (
                  <img width="100%" height="100%" src={image} alt={title} />
                ) : null}
              </div>
            )}
          </article>
        </>
      );
    }
    return (
      <>
        <article
          id="ogCard"
          className={styles.ogCard}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchEnd={(event) => event.stopPropagation()}
        >
          <div className={styles.attribution}>
            <img src={favicon || image} alt={title} loading="lazy" />
            <span className={styles.siteTitle}>{site_name}</span>
          </div>

          <div className={styles.titleWrapper}>
            <a
              href={linkData.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <p>{title}</p>
            </a>
          </div>
          <div className={styles.description}>{description}</div>
          {!video && !image && !favicon ? null : (
            <div className={styles.imageholder}>
              {video ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={video}
                  title={title}
                  allowFullScreen
                  loading="lazy"
                />
              ) : image || favicon ? (
                <img
                  width="100%"
                  height="100%"
                  src={image || favicon}
                  alt={title}
                  loading="lazy"
                />
              ) : null}
            </div>
          )}
        </article>
      </>
    );
  };

  useEffect(() => {
    const extractLinks = async () => {
      const urls = message.match(urlRegex);
      if (urls) {
        const uniqueUrls = [...new Set(urls)];
        setLinkData(null);

        for (let url of uniqueUrls) {
          if (isBlacklisted(url)) {
            continue;
          }

          if (url.endsWith(".gif")) {
            const dbName = "Attachments";
            const storeName = "chat";
            const db = await openDB(dbName, storeName);
            const cachedData = await getAttachment(db, storeName, url).catch(
              () => null
            );
            if (cachedData) {
              const finalURL = URL.createObjectURL(cachedData.data);
              setLinkData({
                image: finalURL,
                title: "GIF Image",
                site_name: new URL(finalURL).hostname,
              });
            } else {
              const imageBlob = await fetchImage(url);
              try {
                saveAttachment(db, storeName, url, imageBlob);
                setLinkData({
                  image: url,
                  title: "GIF Image",
                  site_name: new URL(url).hostname,
                });
              } catch (error) {
                console.log("Failed to save attachment:", error);
              }
            }

            continue;
          }

          const cached = await getCachedData(url);
          if (
            cached &&
            cached.data &&
            (cached.data.image || cached.data.favicon || cached.data.video)
          ) {
            setLinkData(cached.data);
            return;
          }

          try {
            // const opengraphIO = axios
            //   .get(
            //     `https://opengraph.io/api/1.1/site/${encodeURIComponent(
            //       url
            //     )}?accept_lang=auto&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
            //   )
            //   .then(async (response) => {
            //     if (response.data?.hybridGraph) {
            //       console.log(response.data.hybridGraph, "opengraph");
            //       const data = { ...response.data.hybridGraph };
            //       setLinkData((prevData) => ({ ...prevData, ...data }));
            //       await cacheData(url, data);
            //     }
            //   })
            //   .catch((error) => {
            //     console.log("Error from opengraphIO:", error.message);
            //   });

            getURLMetaData(url)
              .then(async (response) => {
                if (response.data?.hybridGraph) {
                  const data = { ...response.data.hybridGraph };
                  setLinkData((prevData) => ({ ...prevData, ...data }));
                  await cacheData(url, data);
                }
              })
              .catch((error) => {
                console.log("Error from yourAPI:", error);
              });
          } catch (error) {
            console.log("General error:", error);
          }
        }
      }
    };
    if (message) {
      extractLinks();
    }
  }, [message]);

  if (!message) return null;

  const urls = message.match(urlRegex);
  if (!urls || urls.every(isBlacklisted)) return null;

  if (!linkData) return renderPlaceholder();

  return renderLinkPreview();
};
