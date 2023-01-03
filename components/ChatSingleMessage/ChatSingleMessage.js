import React, { useState, useEffect } from "react";
import { Picker } from "emoji-mart";
// import 'emoji-mart/css/emoji-mart.css'
import { Avatar } from "../Common/Avatar/Avatar";


import { getDownloadURL } from "../../requests/s3";
import { deleteMessage, updateMessage, } from "../../requests/chat";
import { getURLMetaData } from "../../requests/urls";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import { useChat } from "../../contexts/chat";
import { useComms } from "../../contexts/comms";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";

import { TextBtn } from "../Common/Button";

import styles from "./ChatSingleMessage.module.scss";

const ChatSingleMessage = (props) => {
    const [emojiPickerState, setEmojiPicker] = useState(false);
    const [urls, setUrls] = useState([]);
    const [showEditBar, setShowEditBar] = useState("");

    const {
        _id,
        date,
        creator_image,
        creator_id,
        creator_name,
        message,
        attachments = [],
        reactions = [],
        topic_id,
    } = props.msg;
    const { editMessageText, messageID } = props;

    const { user } = useAuth();
    const { emitUpdate } = useSocket();
    const { selectedcomm } = useComms();

    useEffect(() => {
        async function fetchDownloadURL() {
            if (attachments.length > 0) {
                let promises = [];
                attachments.forEach((att) => {
                    promises.push(
                        new Promise(async (res, rej) => {
                            let bucket = "topic-message-attachments";
                            const data = await getDownloadURL(
                                att.name,
                                att.fileType,
                                bucket
                            );
                            const { ok, downloadURL } = data;
                            if (ok) {
                                res(downloadURL);
                            }
                        })
                    );
                });

                const outputs = await Promise.all(promises);
                setUrls(outputs);
            }
        }
        fetchDownloadURL();
    }, [_id]);

    useEffect(() => {
        replaceURLs();
    }, []);

    const toggleEdit = (show) => {
        if (show) {
            setShowEditBar(_id);
        } else {
            setShowEditBar("");
        }
    };
    const deleteMsg = async () => {
        const data = await deleteMessage(_id);
        let msg = props.msg;
        msg.action = "delete";
        msg.updateType = "message update";
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
                console.log(err);
            }
            let { ok } = status;
            if (ok) {
                console.log("message sent");
            }
        });
    };
    const updateMsg = async () => {
        let msg = props.msg;
        const data = await updateMessage(msg);
        msg.updateType = "message update";
        msg.action = "update";
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
                console.log(err);
            }
            let { ok } = status;
            if (ok) {
                console.log("message sent");
            }
        });
    };
    const editBarSelection = () => {
        editMessageText(props.msg);
    };
    const getTimeStamp = () => {
        let timeStamp;
        let today = new Date();
        let weekBefore = today.setDate(today.getDate() - 6);

        if (
            new Date(date).toLocaleDateString() ===
            new Date().toLocaleDateString()
        ) {
            timeStamp = new Date(date).toLocaleTimeString([], {
                timeStyle: "short",
            });
        } else if (new Date(date) >= new Date(weekBefore)) {
            timeStamp = `${new Date(date).toLocaleDateString("default", {
                weekday: "long",
            })} @ ${new Date(date).toLocaleTimeString([], {
                timeStyle: "short",
            })}`;
        } else {
            timeStamp = `${new Date(date).toLocaleDateString("default", {
                weekday: "long",
            })}, ${new Date(date).toLocaleDateString("default", {
                month: "short",
            })} ${new Date(date).toLocaleDateString("default", {
                day: "numeric",
            })} @ ${new Date(date).toLocaleTimeString([], {
                timeStyle: "short",
            })}`;
        }
        return timeStamp;
    };

    const triggerPicker = (e) => {
        e.preventDefault();
        setEmojiPicker(!emojiPickerState);
    };
    const addEmoji = (e) => {
        reactions.push(e.native);
        updateMsg();
        setEmojiPicker(!emojiPickerState);
    };

    const EmojiPicker = () => {
        if (emojiPickerState) {
            return (
                <Picker
                    //className="attach-emoji"
                    native={true}
                    onSelect={addEmoji}
                    emoji=""
                    color="#1d0a6c"
                    autoFocus={true}
                />
            );
        }
        return null;
    };
    const CreatorImage = () => {
        if (creator_image) {
            return (
                 <img className={styles.SingleMessageAvatar} src={creator_image} alt={creator_name} loading="lazy" />
            );
        }
        return <span className={styles.SingleMessageAvatarNo}></span>;
    };
    const EditBar = () => {
        if (showEditBar && showEditBar == _id) {
            if (creator_id == user._id) {
                return (
                    <div className={styles.SingleMessageControls}>
                        <button
                            value="reaction"
                            title="reaction"
                            onClick={triggerPicker}
                        >
                            <IconAddReactionNoFill />
                        </button>
                        <button
                            value="edit"
                            onClick={editBarSelection}
                            title="edit"
                        >
                            <IconEditNoFill />
                        </button>
                        <button
                            value="delete"
                            onClick={deleteMsg}
                            title="delete"
                        >
                          <IconDeleteNoFill />
                        </button>
                    </div>
                );
            } else {
                return (
                    <div className={styles.SingleMessageControls}>
                        <button
                            value="reaction"
                            title="reaction"
                            onClick={triggerPicker}
                        >
                            <IconAddReactionNoFill />
                        </button>
                    </div>
                );
            }
        }

        return null;
    };

    const wrapLink = (innerHtml, urlRegex) => {
        let rawurl = "";
        let replacedURL = innerHtml.replace(urlRegex, function (url) {
            rawurl = url;
            if (!url.match("^https?://")) {
                url = "http://" + url;
            }

            return (
                '<a href="' +
                url +
                '" target="_blank" rel="noopener noreferrer">' +
                url +
                "</a>"
            );
        });

        return { rawURL: rawurl, alteredURL: replacedURL };
    };

    const replaceURLs = async () => {
        let messageBody = document.getElementById(
            `message-content${messageID}`
        );
        let innerHtml = message;
        if (messageBody) {
            const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            if (urlRegex.test(innerHtml)) {
                let { rawURL, alteredURL } = wrapLink(innerHtml, urlRegex);

                innerHtml = `<span>${alteredURL}</span>`;

                let html = await getURLMetaData(rawURL);

                const { data } = html;

                if (data.ok) {
                    innerHtml += `<article class="og-card">
                        ${
                            data.data.ogSiteName
                                ? `<span>${data.data.ogSiteName}</span>`
                                : ""
                        }
                        ${
                            data.data.ogTitle
                                ? `<span>${data.data.ogTitle}</span>`
                                : ""
                        }
                        ${
                            data.data.ogDescription
                                ? `<p>${data.data.ogDescription}</p>`
                                : ""
                        }
                        ${
                            data.data.ogImage
                                ? `<img src="${data.data.ogImage.url}" alt="${data.data.ogTitle}" />`
                                : ""
                        }
                        </article>`;
                }
                messageBody.innerHTML = innerHtml;
            } else {
                if (innerHtml !== undefined) {
                    messageBody.innerHTML = `<span>${innerHtml}</span>`;
                }
            }
        }
    };

    let timeStamp = getTimeStamp();
    return (
        <div
            className={styles.SingleMessage}
            onMouseEnter={() => toggleEdit(true)}
            onMouseLeave={() => {
                toggleEdit(false);
                setEmojiPicker(false);
            }}
        >
            <CreatorImage />
            <EmojiPicker />
            <EditBar />
            <div className={styles.SingleMessageBody}>
                <span className={styles.Info}>
                    <p className={styles.Creator}>
                        {creator_name}
                    </p>
                    <p className={styles.Timestamp}>
                        {timeStamp}
                    </p>
                </span>
                {(urls || []).map((url) => (
                        <img src={url} key={url} />
                    ))} 

                <div
                    id={`message-content${messageID}`}
                    className={styles.Content}
                >
                   

                </div>
                <div className={styles.SingleMessageBodyReactions}>
                    {[...(reactions || [])].map((reaction, index) => (
                        <p
                            className={styles.SingleMessageBodyReactionsEmoji}
                            key={index}
                        >
                            {reaction}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatSingleMessage;
