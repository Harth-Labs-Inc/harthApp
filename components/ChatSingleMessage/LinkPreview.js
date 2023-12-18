import { useEffect, useState } from "react";
import styles from "./ChatSingleMessage.module.scss";
import axios from "axios";
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
    //"instagram.com",
    "amazon.com",
    "x.com",
    "facebook.com",
    "facebookuserprivacysettlement.com",
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
                  className={styles.videoFrame}
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

  const checkImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve(true);
      };

      img.onerror = () => {
        resolve(false);
      };

      img.src = url;
    });
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
            (cached.data.image || cached.data.favicon || cached.data.video) &&
            cached.data.title
          ) {
            setLinkData(cached.data);
            return;
          }

          let isOpengraphIOComplete = false;
          let isCustomAPIComplete = false;
          let tempLinkData = {};

          const fetchOpenGraphIO = () => {
            return axios.get(
              `https://opengraph.io/api/1.1/site/${encodeURIComponent(
                url
              )}?accept_lang=auto&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
            );
          };
          const fetchCustomAPI = () => {
            return getURLMetaData(url);
          };
          const compareAndUpdateLinkData = async (
            newData,
            existingData = {},
            isSecondCall = false
          ) => {
            if (
              (!isSecondCall || !existingData?.title) &&
              newData?.title &&
              newData.title !== "Just a moment..."
            ) {
              existingData.title = newData.title;
            }

            if ((!isSecondCall || !existingData?.image) && newData?.image) {
              let goodImage = await checkImage(newData?.image);
              if (goodImage) {
                existingData.image = newData.image;
              }
            }
            if (
              (!isSecondCall || !existingData?.site_name) &&
              newData?.site_name
            ) {
              existingData.site_name = newData.site_name;
            }
            if (
              (!isSecondCall || !existingData?.description) &&
              newData?.description
            ) {
              existingData.description = newData.description;
            }
            if ((!isSecondCall || !existingData?.video) && newData?.video) {
              existingData.video = newData.video;
            }
            if ((!isSecondCall || !existingData?.favicon) && newData?.favicon) {
              existingData.favicon = newData.favicon;
            }
            if ((!isSecondCall || !existingData?.url) && newData?.url) {
              existingData.url = newData.url;
            }
            return existingData;
          };

          const opengraphIOPromise = fetchOpenGraphIO().then((response) => {
            isOpengraphIOComplete = true;
            return response;
          });

          const customAPIPromise = fetchCustomAPI().then((response) => {
            isCustomAPIComplete = true;
            return response;
          });

          const firstResponse = await Promise.race([
            opengraphIOPromise,
            customAPIPromise,
          ]);

          if (firstResponse.data?.hybridGraph) {
            tempLinkData = await compareAndUpdateLinkData(
              firstResponse.data.hybridGraph,
              tempLinkData,
              false
            );
          }

          const isDataIncomplete = (data) => {
            const imageOrVideoMissing = !data.image && !data.video;
            const titleOrDescriptionMissing = !data.title || !data.description;

            return imageOrVideoMissing || titleOrDescriptionMissing;
          };

          if (isDataIncomplete(firstResponse.data?.hybridGraph)) {
            const otherPromise = isOpengraphIOComplete
              ? customAPIPromise
              : opengraphIOPromise;
            const secondResponse = await otherPromise;
            if (secondResponse.data?.hybridGraph) {
              tempLinkData = await compareAndUpdateLinkData(
                secondResponse.data.hybridGraph,
                tempLinkData,
                true
              );
            }
          }

          if (Object.keys(tempLinkData).length) {
            setLinkData(tempLinkData);
            await cacheData(url, tempLinkData);
            tempLinkData = {};
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
