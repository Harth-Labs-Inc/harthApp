import { useEffect, useRef, useState, useCallback } from "react";
import ImageViewer from "react-simple-image-viewer";
import styles from "./ChatInput.module.scss";
import { getDownloadURL } from "requests/s3";
import Image from "next/image";

const DEFAULT_OPTIONS = {
  config: { attributes: true, childList: true, subtree: true },
};
function useMutationObservable(targetEl, cb, options = DEFAULT_OPTIONS) {
  const [observer, setObserver] = useState(null);

  useEffect(() => {
    const obs = new MutationObserver(cb);
    setObserver(obs);
  }, [cb, options, setObserver]);

  useEffect(() => {
    if (!observer) return;
    const { config } = options;
    observer.observe(targetEl, config);
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer, targetEl, options]);
}

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#2f1d2a" offset="20%" />
      <stop stop-color="#282828" offset="50%" />
      <stop stop-color="#2f1d2a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? // eslint-disable-next-line
      Buffer.from(str).toString("base64")
    : window.btoa(str);

export default function ChatAttachment({
  attachments,
  bucket = "room-attachments",
}) {
  const listRef = useRef();
  const [count, setCount] = useState(2);
  const [images, setImages] = useState([]);
  const [ratio, setRatio] = useState(16 / 9);
  const [showImageSlideShow, setShowImageSlideShow] = useState(false);
  const [imageSlideshowURL, setImageSlideshowURL] = useState();

  const onListMutation = useCallback(
    (mutationList) => {
      setCount(mutationList[0].target.children.length);
    },
    [setCount]
  );

  useEffect(() => {
    // console.log('new list item added', listRef.current)
  }, [count]);

  useEffect(() => {
    async function fetchDownloadURL() {
      if (attachments.length > 0) {
        let promises = [];
        attachments.forEach((att) => {
          promises.push(
            new Promise(async (res) => {
              const data = await getDownloadURL(att.name, att.fileType, bucket);
              if (data) {
                const { ok, downloadURL } = data;
                if (ok) {
                  res(downloadURL);
                }
              }
            })
          );
        });

        Promise.all(promises).then((outputs) => setImages(outputs));
      }
    }
    fetchDownloadURL();
    return () => {
      setImages([]);
    };
  }, [attachments]);

  useMutationObservable(listRef.current, onListMutation);

  const openImageSlideShow = async (idx, atts, bucket) => {
    let att = atts[idx];
    let name = { ...att }?.name || "";
    if (name.includes("thumbnail")) {
      name = name.replace("thumbnail", "full");
    }
    const data = await getDownloadURL(name, att.fileType, bucket);
    if (data) {
      const { ok, downloadURL } = data;
      if (ok) {
        setShowImageSlideShow(true);
        setImageSlideshowURL(downloadURL);
      }
    }
  };

  const resetImageSLideshow = () => {
    setImageSlideshowURL(null);
    setShowImageSlideShow(false);
  };
  return (
    <>
      {showImageSlideShow ? (
        <>
          <div className={styles.imageViewer}>
            <ImageViewer
              src={[imageSlideshowURL]}
              closeOnClickOutside={true}
              onClose={resetImageSLideshow}
              backgroundStyle={{
                backgroundColor: "rgba(0,0,0,0.92)",
                height: "100vh",
                width: "100vw",
              }}
            />
          </div>
        </>
      ) : null}

      <ul ref={listRef} className={styles.MessageAttachments}>
        {images.map((url, idx) => {
          return (
            <li key={url} className={styles.MessageAttachmentsItem}>
              <Image
                key={url}
                className="active-image"
                src={url}
                width={150}
                height={150 / ratio}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(
                  shimmer(200, 200 / ratio)
                )}`}
                alt="message image"
                onClick={() => openImageSlideShow(idx, attachments, bucket)}
                onLoadingComplete={({ naturalWidth, naturalHeight }) =>
                  setRatio(naturalHeight / naturalWidth)
                }
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
