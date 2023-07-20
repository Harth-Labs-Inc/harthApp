import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ChatSingleMessage.module.scss";
import Placeholder from "components/Common/placeholder/placeholder";

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
