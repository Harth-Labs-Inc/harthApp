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

  const renderLinkPreview = () => {
    if (linkData) {
      const { title, site_name, description, video, image, favicon } = linkData;

      if (site_name === "amazon.com") {
        return null;
      }

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
    }

    return null;
  };

  return renderLinkPreview();
};

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { getURLMetaData } from "../../requests/urls";
// import styles from "./ChatSingleMessage.module.scss";

// export const LinkPreview = ({ message }) => {
//   const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
//   const [rawURL, setRawURL] = useState();
//   const [alteredURL, setAlteredURL] = useState();
//   const [ogData, setOgData] = useState();
//   const [linkPreview, setLinkPreview] = useState(null);

//   const getHostName = (url) => {
//     const hostnameRegex = /^https?:\/\/(?:www\.)?([^/?#]+)(?:[/?#]|$)/i;
//     const matches = url.match(hostnameRegex);
//     if (matches && matches.length > 1) {
//       const hostname = matches[1].toLowerCase();
//       if (hostname === "amazon.com") {
//         return "amazon";
//       } else if (hostname === "twitter.com") {
//         return "twitter";
//       } else if (hostname === "tiktok.com") {
//         return "tiktok";
//       } else if (hostname === "youtu.be" || hostname === "youtube.com") {
//         return "youtube";
//       }
//     }
//     return null;
//   };

//   const wrapLink = (innerHtml, urlRegex) => {
//     let rawUrl = "";
//     const replacedURL = innerHtml.replace(urlRegex, function (url) {
//       rawUrl = url;
//       return url;
//     });
//     setRawURL(rawUrl);
//     setAlteredURL(replacedURL);
//   };

//   const getMetaData = async (url) => {
//     const token = localStorage.getItem("token");
//     const { data } = await getURLMetaData(url, token);
//     if (data.ok) {
//       setOgData(data.data);
//     }
//   };

//   const getLinkPreview = async (url) => {
//     try {
//       const responseWithoutProxy = await axios.get(
//         `https://opengraph.io/api/1.1/site/${encodeURIComponent(
//           url
//         )}?accept_lang=auto&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
//       );

//       if (
//         responseWithoutProxy.status === 200 &&
//         responseWithoutProxy.data?.hybridGraph
//       ) {
//         setLinkPreview(responseWithoutProxy.data.hybridGraph);
//         return;
//       }

//       const responseWithProxy = await axios.get(
//         `https://opengraph.io/api/1.1/site/${encodeURIComponent(
//           url
//         )}?accept_lang=auto&use_proxy=true&app_id=bc82985a-b469-4157-8620-76c822cab0c5`
//       );

//       if (
//         responseWithProxy.status === 200 &&
//         responseWithProxy.data?.hybridGraph
//       ) {
//         setLinkPreview(responseWithProxy.data.hybridGraph);
//         return;
//       }

//       getMetaData(url);
//     } catch (error) {
//       console.log("Fallback");
//       getMetaData(url);
//     }
//   };

//   useEffect(() => {
//     if (urlRegex.test(message)) {
//       wrapLink(message, urlRegex);
//     }
//   }, [message]);

//   useEffect(() => {
//     if (rawURL) {
//       getLinkPreview(rawURL);
//     }
//   }, [rawURL]);

//   if (
//     linkPreview &&
//     (linkPreview.title ||
//       linkPreview.site_name ||
//       linkPreview.description ||
//       linkPreview.video ||
//       linkPreview.imageSecureUrl ||
//       linkPreview.favicon)
//   ) {
//     if (getHostName(rawURL) === "amazon") {
//       return null;
//     }

//     return (
//       <>
//         <br />
//         <article
//           id="ogCard"
//           className={styles.ogCard}
//           onTouchStart={(event) => event.stopPropagation()}
//           onTouchEnd={(event) => event.stopPropagation()}
//         >
//           <div className={styles.attribution}>
//             {getHostName(rawURL) === "tiktok" ? (
//               <>
//                 <img
//                   src="/images/tiktok_logo.png"
//                   alt="TikTok Post"
//                   loading="lazy"
//                 />
//                 <p>TikTok</p>
//               </>
//             ) : (
//               <>
//                 <img
//                   src={linkPreview?.favicon || linkPreview?.image}
//                   alt={linkPreview?.title}
//                   loading="lazy"
//                 />
//                 <p>
//                   {getHostName(rawURL) === "youtube"
//                     ? "YouTube"
//                     : linkPreview?.site_name}
//                 </p>
//               </>
//             )}
//           </div>
//           <a
//             href={rawURL}
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{ textDecoration: "none" }}
//           >
//             <div className={styles.title}>
//               {linkPreview?.title || linkPreview?.site_name}
//             </div>
//           </a>
//           <div className={styles.description}>{linkPreview?.description}</div>
//           {linkPreview?.video ? (
//             <iframe
//               width="100%"
//               height="315"
//               src={linkPreview?.video}
//               title={linkPreview?.title}
//               allowFullScreen
//               loading="lazy"
//             />
//           ) : linkPreview?.image ||
//             linkPreview?.imageSecureUrl ||
//             linkPreview?.favicon ? (
//             <img
//               src={
//                 linkPreview?.image ||
//                 linkPreview?.imageSecureUrl ||
//                 linkPreview?.favicon
//               }
//               alt={linkPreview?.title}
//               loading="lazy"
//             />
//           ) : null}
//         </article>
//       </>
//     );
//   }

//   if (ogData) {
//     return (
//       <>
//         <br />
//         <a
//           href={rawURL}
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ textDecoration: "none" }}
//         >
//           <article
//             id="ogCard"
//             className={styles.ogCard}
//             onTouchStart={(event) => event.stopPropagation()}
//             onTouchEnd={(event) => event.stopPropagation()}
//           >
//             <div className={styles.attribution}>
//               <img
//                 src={ogData?.result?.favicon}
//                 alt={ogData?.result?.ogSiteName}
//                 loading="lazy"
//               />
//               <p>{ogData?.result?.ogSiteName}</p>
//             </div>
//             <span className={styles.title}>
//               {ogData?.result?.ogTitle || ogData?.result?.ogSiteName}
//             </span>
//             <span>{ogData?.result?.ogDescription}</span>
//             <img
//               src={ogData?.result?.ogImage?.url || ogData?.result?.favicon}
//               alt={ogData?.result?.ogTitle}
//               loading="lazy"
//             />
//           </article>
//         </a>
//       </>
//     );
//   }

//   if (rawURL) {
//     if (getHostName(rawURL) === "twitter") {
//       return null;
//     }

//     return (
//       <>
//         <article
//           id="ogCard"
//           className={styles.ogCard}
//           onTouchStart={(event) => event.stopPropagation()}
//           onTouchEnd={(event) => event.stopPropagation()}
//         >
//           <a href={rawURL} target="_blank" rel="noopener noreferrer">
//             {alteredURL}
//           </a>
//         </article>
//       </>
//     );
//   }

//   return null;
// };
