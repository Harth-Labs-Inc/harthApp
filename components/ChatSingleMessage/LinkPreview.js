import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ChatSingleMessage.module.scss";

export const LinkPreview = ({ message }) => {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  const [linkData, setLinkData] = useState(null);

  useEffect(() => {
    const extractLinks = () => {
      const urls = message.match(urlRegex);
      if (urls) {
        const uniqueUrls = [...new Set(urls)];
        setLinkData(null);

        uniqueUrls.forEach(async (url) => {
          try {
            const response = await axios.get(
              `https://opengraph.io/api/1.1/site/${encodeURIComponent(
                url
              )}?accept_lang=auto&use_proxy=true&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
            );

            if (
              response.status === 200 &&
              response.data?.hybridGraph &&
              !linkData
            ) {
              setLinkData(response.data.hybridGraph);
            }
          } catch (error) {
            console.log(error);
          }
        });
      }
    };
    if (message) {
      extractLinks();
    }
  }, [message]);

  const renderPlaceholder = () => {
    return (
      <div
        style={{ width: "100%", height: "550px", background: "transparent" }}
      ></div>
    );
  };

  const renderLinkPreview = () => {
    const { title, site_name, description, video, image, favicon } = linkData;

    return (
      <>
        <br />
        <article
          id="ogCard"
          className={styles.ogCard}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchEnd={(event) => event.stopPropagation()}
        >
          <div className={styles.attribution}>
            {site_name === "tiktok" ? (
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
                <img src={favicon || image} alt={title} loading="lazy" />
                <p>{site_name === "youtube" ? "YouTube" : site_name}</p>
              </>
            )}
          </div>
          <a
            href={linkData.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div className={styles.title}>{title || site_name}</div>
          </a>
          <div className={styles.description}>{description}</div>
          {video ? (
            <iframe
              width="100%"
              height="315"
              src={video}
              title={title}
              allowFullScreen
              loading="lazy"
            />
          ) : image || favicon ? (
            <img src={image || favicon} alt={title} loading="lazy" />
          ) : null}
        </article>
      </>
    );
  };

  const urls = message?.match(urlRegex);
  if (urls) {
    return linkData ? renderLinkPreview() : renderPlaceholder();
  }
  return null;
};
