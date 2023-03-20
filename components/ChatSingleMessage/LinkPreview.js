import { useEffect, useState } from "react";

import { getURLMetaData } from "../../requests/urls";

import styles from "./ChatSingleMessage.module.scss";

export const LinkPreview = ({ message }) => {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
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

    const getMetaData = async (url) => {
        getURLMetaData(url).then(({ data }) => {
            if (data.ok) {
                setOgData(data.data);
            }
        });
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

    if (ogData) {
        return (
            <article id="ogCard" className={styles.ogCard}>
                <span>
                    {ogData?.result?.ogTitle || ogData?.result?.ogSiteName}
                </span>
                <span>{ogData?.result?.ogDescription}</span>
                <img
                    src={
                        ogData?.result?.ogImage?.url || ogData?.result?.favicon
                    }
                    alt={ogData?.result?.ogTitle}
                    loading="lazy"
                />
            </article>
        );
    }

    if (rawURL) {
        return (
            <a href={rawURL} target="_blank" rel="noopener noreferrer">
                {/* {alteredURL} */}
            </a>
        );
    }

    return null;
};
