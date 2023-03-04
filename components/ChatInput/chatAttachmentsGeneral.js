import { useEffect, useRef, useState, useCallback } from "react";

import styles from "./ChatInput.module.scss";

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

export default function ChatAttachment({ attachments }) {
    const listRef = useRef();
    const [count, setCount] = useState(2);
    const [images, setImages] = useState([]);
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
        if (attachments) {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl;
            for (let att of attachments) {
                if (att.name) {
                    imageUrl = urlCreator.createObjectURL(att);
                } else {
                    var arrayBufferView = new Uint8Array(att);
                    var blob = new Blob([arrayBufferView], {
                        type: "image/jpeg",
                    });

                    imageUrl = urlCreator.createObjectURL(blob);
                }

                setImages([...images, imageUrl]);
            }
        }
    }, [attachments]);

    useMutationObservable(listRef.current, onListMutation);

    return (
        <ul ref={listRef} className={styles.MessageAttachments}>
            {images.map((f) => {
                return (
                    <li key={f} className={styles.MessageAttachmentsItem}>
                        <img src={f} loading="lazy" />
                    </li>
                );
            })}
        </ul>
    );
}
