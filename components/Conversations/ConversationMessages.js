import { useState, useRef, useContext, useEffect } from "react";
import ImageViewer from "react-simple-image-viewer";

import { useComms } from "../../contexts/comms";
import styles from "./ConversationMessages.module.scss";
import { MobileContext } from "../../contexts/mobile";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import DumbChatInput from "../DumbChatInput/DumbChatInput";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import {
    saveConversationMessage,
    addKeyToConversationDB,
    updateConversationMessage,
} from "../../requests/conversations";
import {
    getUploadURL,
    putImageInBucket,
    getDownloadURL,
} from "../../requests/s3";

/* eslint-disable */

export const ConversationMessages = () => {
    const [bottom, setBottom] = useState(null);
    const [inview, setInview] = useState(null);
    const [displayScrollButton, setDisplayScrollButton] = useState(false);
    const [msgReload, triggerMsgReload] = useState(0);
    const [editMessageObj, setEditMessageObj] = useState({});
    const [conversationInputs, setConversationInputs] = useState({});
    const [currentMessages, setCurrentMessages] = useState([]);
    const [disableChat, setDisableChat] = useState(false);
    const [messageEditing, setMessageEditing] = useState();
    const [uploadingAttachments, setUploadingAttachments] = useState([]);
    const [showImageSlideShow, setShowImageSlideShow] = useState(false);
    const [imageSlideshowURL, setImageSlideshowURL] = useState();

    const {
        selectedcomm,
        // conversations,
        selectedConversation,
        setConversationMessages,
        conversationMessages,
        unreadConversationMsgs,
        // unreadConversationMsg,
        incomingConversationMsg,
        incomingConversationMsgUpdate,
    } = useComms();
    const { user } = useAuth();
    const { emitUpdate } = useSocket();

    // const bottomObserver = useRef(null);
    const messagesEndRef = useRef(null);
    const { isMobile } = useContext(MobileContext);

    useEffect(() => {
        if (incomingConversationMsg && conversationMessages) {
            const { conversation_id } = incomingConversationMsg;
            let tempMsgs = conversationMessages[conversation_id];
            if (tempMsgs && conversation_id) {
                let msgs = [incomingConversationMsg, ...tempMsgs];

                setConversationMessages({
                    ...conversationMessages,
                    [conversation_id]: msgs,
                });
            }
        }
    }, [incomingConversationMsg]);

    useEffect(() => {
        if (incomingConversationMsgUpdate && conversationMessages) {
            const { conversation_id, action, _id } =
                incomingConversationMsgUpdate;

            let tempMsgs = conversationMessages[conversation_id];
            if (tempMsgs && conversation_id) {
                if (action == "delete") {
                    let filteredMsgs = tempMsgs.filter(
                        (msg) => msg._id !== _id
                    );
                    setConversationMessages({
                        ...conversationMessages,
                        [conversation_id]: filteredMsgs,
                    });
                }
                if (action == "update") {
                    let index;
                    tempMsgs.forEach((msg, idx) => {
                        if (msg._id === _id) {
                            index = idx;
                        }
                        if (tempMsgs[index]) {
                            tempMsgs[index].reactions =
                                incomingConversationMsgUpdate.reactions;
                            tempMsgs[index].flames =
                                incomingConversationMsgUpdate.flames;
                            tempMsgs[index].message =
                                incomingConversationMsgUpdate.message;
                        }
                        setConversationMessages({
                            ...conversationMessages,
                            [conversation_id]: tempMsgs,
                        });
                    });
                }
                triggerMsgReload((prevState) => (prevState += 1));
            }
        }
    }, [incomingConversationMsgUpdate]);

    useEffect(() => {
        if (conversationMessages && selectedConversation) {
            let tempMsgs = [
                ...(conversationMessages[selectedConversation._id] || []),
            ];
            if (unreadConversationMsgs.length && tempMsgs && tempMsgs.length) {
                let readIds = [];
                unreadConversationMsgs.forEach((msg) => {
                    if (msg.conversation_id == selectedConversation._id) {
                        readIds.push(msg._id);
                    }
                });

                // const tempUnread = unreadConversationMsgs.filter(
                //     (msg) => !readIds.includes(msg._id)
                // );
            }
            if (inview) {
                scrollToBottom("smooth");
            } else {
                setDisplayScrollButton(true);
            }

            setCurrentMessages(tempMsgs);
        }
    }, [conversationMessages, selectedConversation]);

    useEffect(() => {
        if (selectedConversation) {
            const numberOfUsers = selectedConversation.users?.length;

            if (numberOfUsers <= 1) {
                setDisableChat(true);
            }
        }
    }, [selectedConversation]);

    const editMessage = (msg) => {
        setEditMessageObj(msg);
    };

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };
    // const ScrollButton = () => {
    //   if (displayScrollButton) {
    //     return (
    //       <button onClick={scrollToBottom} className="scroll-to-bottom">
    //         New Message
    //       </button>
    //     );
    //   }
    //   return null;
    // };
    const sumbitMessageHandler = async ({ msg, atts, parentID }) => {
        if (parentID) {
            let creator = selectedConversation.users?.find(
                (usr) => usr.userId === user?._id
            );
            let ids = selectedConversation.users?.map((usr) => usr.userId);
            let newMessage = {
                creator_id: user?._id,
                creator_name: creator.name,
                creator_image: creator.iconKey || "",
                comm_id: selectedcomm?._id,
                bookmarked: false,
                date: new Date(),
                message: msg,
                reactions: [],
                attachments: [],
                userIDS: ids,
                conversation_id: parentID,
            };

            const data = await saveConversationMessage(newMessage);

            let { id, ok } = data;
            if (ok) {
                if (id) {
                    newMessage._id = id;
                }
                if (atts.length > 0) {
                    uploadAttacments(id, newMessage, atts);
                } else {
                    broadcastMessage(newMessage);
                }
            }
        }
    };
    const broadcastMessage = (message) => {
        setUploadingAttachments([]);

        message.updateType = "new conversation message";
        setConversationInputs({
            ...conversationInputs,
            [selectedConversation?._id]: "",
        });
        emitUpdate(selectedcomm?._id, message, async (err) => {
            if (err) {
                console.error(err);
            }
        });
    };
    const uploadAttacments = async (id, newMessage, atts) => {
        let promises = [];
        atts.forEach((file, idx) => {
            setUploadingAttachments((prevAttchs) => [...prevAttchs, file.name]);
            promises.push(
                new Promise(async (res) => {
                    let extention = file.name.split(".").pop();
                    let name = `${id}_${idx + 1}.${extention}`;
                    let bucket = "gather-message-attachments";
                    const data = await getUploadURL(name, file.type, bucket);
                    const { ok, uploadURL } = data;
                    if (ok) {
                        let reader = new FileReader();
                        reader.addEventListener("loadend", async () => {
                            let result = await putImageInBucket(
                                uploadURL,
                                reader,
                                file.type
                            );
                            let { status } = result;
                            if (status == 200) {
                                await addKeyToConversationDB(
                                    id,
                                    name,
                                    file.type
                                );
                                res({ name, fileType: file.type });
                            }
                        });
                        reader.readAsArrayBuffer(file);
                    }
                })
            );
        });

        const outputs = await Promise.all(promises);
        newMessage.attachments = outputs;
        broadcastMessage(newMessage);
    };
    const updateConversation = async (selectedEditMsg, selectedInputID) => {
        let msg = selectedEditMsg;
        msg.message = conversationInputs[selectedInputID];
        await updateConversationMessage(msg);
        msg.updateType = "conversation message update";
        msg.action = "update";
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
                console.error(err);
            }
            let { ok } = status;
            if (ok) {
                cancelEdit(selectedInputID);
            }
        });
        resetEdit();
        toggleEditing();
    };
    const openImageSlideShow = async (idx, attachments) => {
        let att = attachments[idx];
        let name = { ...att }?.name || "";
        if (name.includes("thumbnail")) {
            name = name.replace("thumbnail", "full");
        }
        const data = await getDownloadURL(
            name,
            att.fileType,
            "gather-message-attachments"
        );
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
    const cancelEdit = (selectedInputID) => {
        setConversationInputs({ ...conversationInputs, [selectedInputID]: "" });
    };
    const resetEdit = () => {
        setEditMessageObj({});
    };
    const toggleEditing = (msgId) => {
        setMessageEditing(msgId);
    };

    // const updateMsg = async () => {
    //     let msg = selectedEditMsg;
    //     msg.message = topicInputs[selectedTopic?._id];
    //     await updateMessage(msg);
    //     msg.updateType = "message update";
    //     msg.action = "update";
    //     emitUpdate(selectedcomm?._id, msg, async (err, status) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //         let { ok } = status;
    //         if (ok) {
    //             cancelEdit();
    //         }
    //     });
    // };

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
                            }}
                        />
                    </div>
                </>
            ) : null}
            <div className={styles.Holder}>
                <div id={styles.ChatMessages}>
                    <div ref={messagesEndRef} />
                    <div ref={setBottom} />
                    {currentMessages &&
                        currentMessages.map((msg) => (
                            <ChatSingleMessage
                                msgReload={msgReload}
                                editMessageText={editMessage}
                                msg={msg}
                                key={msg?._id}
                                messageID={msg?._id}
                                openImageSlideShow={openImageSlideShow}
                                showImageSlideShow={showImageSlideShow}
                                imageSlideshowURL={imageSlideshowURL}
                                resetImageSLideshow={resetImageSLideshow}
                                bucket="gather-message-attachments"
                                chatType="gather"
                                resetEdit={resetEdit}
                                isEditing={
                                    messageEditing === msg?._id ? true : false
                                }
                                toggleEditing={toggleEditing}
                            />
                        ))}
                    {/* <ScrollButton /> */}
                </div>

                {isMobile ? (
                    <div className={styles.InputMobile}>
                        <DumbChatInput
                            selectedEdit={editMessageObj}
                            Inputs={conversationInputs}
                            setInputs={setConversationInputs}
                            selectedInputID={selectedConversation?._id}
                            sendMessagge={sumbitMessageHandler}
                            updateMessage={updateConversation}
                            disableChat={disableChat}
                            resetEdit={resetEdit}
                            toggleEditing={toggleEditing}
                            uploading={uploadingAttachments}
                        ></DumbChatInput>
                    </div>
                ) : (
                    <div className={styles.InputDesktop}>
                        <DumbChatInput
                            selectedEdit={editMessageObj}
                            Inputs={conversationInputs}
                            setInputs={setConversationInputs}
                            selectedInputID={selectedConversation?._id}
                            sendMessagge={sumbitMessageHandler}
                            updateMessage={updateConversation}
                            disableChat={disableChat}
                            resetEdit={resetEdit}
                            toggleEditing={toggleEditing}
                            uploading={uploadingAttachments}
                        ></DumbChatInput>
                    </div>
                )}
            </div>
        </>
    );
};
