import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ChatSingleMessage.module.scss";
import Placeholder from "components/Common/placeholder/placeholder";
import { getAttachment, openDB, saveAttachment } from "services/helper";

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
  const blacklist = new Set(["twitter.com", "instagram.com", "amazon.com"]);

  const isBlacklisted = (url) => {
    try {
      const parsedURL = new URL(url);
      return blacklist.has(parsedURL.hostname);
    } catch (e) {
      console.error(`Failed to parse URL: ${url}`);
      return false;
    }
  };

  const renderPlaceholder = () => {
    return <Placeholder />;
  };

  const renderLinkPreview = () => {
    const { title, site_name, description, video, image, favicon } = linkData;

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
            console.log(`Skipping blacklisted URL: ${url}`);
            continue;
          }

          const cached = await getCachedData(url);
          if (cached) {
            setLinkData(cached.data);
            return;
          }

          try {
            const response = await axios.get(
              `https://opengraph.io/api/1.1/site/${encodeURIComponent(
                url
              )}?accept_lang=auto&use_proxy=true&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
            );

            if (response.status === 200 && response.data?.hybridGraph) {
              setLinkData(response.data.hybridGraph);
              await cacheData(url, response.data.hybridGraph);
            }
          } catch (error) {
            console.log(error);
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
