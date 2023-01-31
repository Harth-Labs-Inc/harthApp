import { useState, useRef, useContext, useEffect } from "react";
import { useComms } from "../../contexts/comms";
import styles from "./ConversationMessages.module.scss";
import { MobileContext } from "../../contexts/mobile";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import DumbChatInput from "../DumbChatInput/DumbChatInput";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import { saveConversationMessage } from "../../requests/conversations";
import { getUploadURL, putImageInBucket } from "../../requests/s3";

export const ConversationMessages = () => {
    const [bottom, setBottom] = useState(null);
    const [inview, setInview] = useState(null);
    const [displayScrollButton, setDisplayScrollButton] = useState(false);
    const [msgReload, triggerMsgReload] = useState(0);
    const [editMessageObj, setEditMessageObj] = useState({});
    const [conversationInputs, setConversationInputs] = useState({});
    const [currentMessages, setCurrentMessages] = useState([]);

    const {
        selectedcomm,
        conversations,
        selectedConversation,
        setConversationMessages,
        conversationMessages,
        unreadConversationMsgs,
        unreadConversationMsg,
        incomingConversationMsg,
    } = useComms();
    const { user } = useAuth();
    const { emitUpdate } = useSocket();

    const bottomObserver = useRef(null);
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

                let tempUnread = unreadConversationMsgs.filter(
                    (msg) => !readIds.includes(msg._id)
                );
                // setUnreadMsgs(tempUnread);
            }
            if (inview) {
                scrollToBottom("smooth");
            } else {
                setDisplayScrollButton(true);
            }

            setCurrentMessages(tempMsgs);
        }
    }, [conversationMessages, selectedConversation]);

    const editMessage = (msg) => {
        setEditMessageObj(msg);
    };
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };
    const ScrollButton = () => {
        if (displayScrollButton) {
            return (
                <button onClick={scrollToBottom} className="scroll-to-bottom">
                    New Message
                </button>
            );
        }
        return null;
    };
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
                    // uploadAttacments(id, newMessage);
                } else {
                    broadcastMessage(newMessage);
                }
            }
        }
    };
    const broadcastMessage = (message) => {
        message.updateType = "new conversation message";
        setConversationInputs({
            ...conversationInputs,
            [selectedConversation?._id]: "",
        });
        emitUpdate(selectedcomm?._id, message, async (err, status) => {
            if (err) {
                console.log(err);
            }
        });
    };
    // const uploadAttacments = async (id, message) => {
    //     let promises = [];
    //     attachments.forEach((file, idx) => {
    //         promises.push(
    //             new Promise(async (res, rej) => {
    //                 let extention = file.name.split(".").pop();
    //                 let name = `${id}_${idx + 1}.${extention}`;
    //                 let bucket = "conversation-message-attachments";
    //                 const data = await getUploadURL(name, file.type, bucket);
    //                 const { ok, uploadURL } = data;
    //                 if (ok) {
    //                     let reader = new FileReader();
    //                     reader.addEventListener("loadend", async () => {
    //                         let result = await putImageInBucket(
    //                             uploadURL,
    //                             reader,
    //                             file.type
    //                         );
    //                         let { status } = result;
    //                         if (status == 200) {
    //                             // await addKeyToDB(id, name, file.type);
    //                             res({ name, fileType: file.type });
    //                         }
    //                     });
    //                     reader.readAsArrayBuffer(file);
    //                 }
    //             })
    //         );
    //     });

    //     const outputs = await Promise.all(promises);
    //     message.attachments = outputs;
    //     broadcastMessage(message);
    // };

    //   const sendMessagge = async () => {
    //     if (selectedTopic) {
    //         let creator = selectedcomm.users.find(
    //             (usr) => usr.userId === user?._id
    //         );

    //         let newMessage = {
    //             creator_id: user?._id,
    //             creator_name: creator.name,
    //             creator_image: creator.iconKey,
    //             topic_id: selectedTopic?._id,
    //             comm_id: selectedcomm?._id,
    //             bookmarked: false,
    //             date: new Date(),
    //             message: topicInputs[selectedTopic?._id],
    //             flames: [],
    //             reactions: [],
    //             attachments: [],
    //             replies: [],
    //         };

    //         const data = await saveMessage(newMessage);

    //         let { id, ok } = data;
    //         if (ok) {
    //             if (id) {
    //                 newMessage._id = id;
    //             }
    //             if (attachments.length > 0) {
    //                 uploadAttacments(id, newMessage);
    //             } else {
    //                 broadcastMessage(newMessage);
    //             }
    //         }
    //     }
    // };
    // const broadcastMessage = (message) => {
    //     setAttachments([]);
    //     message.updateType = "new message";
    //     setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    //     emitUpdate(selectedcomm?._id, message, async (err, status) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    // };
    // const uploadAttacments = async (id, message) => {
    //     let promises = [];
    //     attachments.forEach((file, idx) => {
    //         promises.push(
    //             new Promise(async (res, rej) => {
    //                 let extention = file.name.split(".").pop();
    //                 let name = `${id}_${idx + 1}.${extention}`;
    //                 let bucket = "topic-message-attachments";
    //                 const data = await getUploadURL(name, file.type, bucket);
    //                 const { ok, uploadURL } = data;
    //                 if (ok) {
    //                     let reader = new FileReader();
    //                     reader.addEventListener("loadend", async () => {
    //                         let result = await putImageInBucket(
    //                             uploadURL,
    //                             reader,
    //                             file.type
    //                         );
    //                         let { status } = result;
    //                         if (status == 200) {
    //                             await addKeyToDB(id, name, file.type);
    //                             res({ name, fileType: file.type });
    //                         }
    //                     });
    //                     reader.readAsArrayBuffer(file);
    //                 }
    //             })
    //         );
    //     });

    //     const outputs = await Promise.all(promises);
    //     message.attachments = outputs;
    //     broadcastMessage(message);
    // };
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

    console.log(conversationMessages, "conversationMessages");

    return (
        <>
            <div className={styles.Holder}>
                <div id={styles.ChatMessages}>
                    <div ref={messagesEndRef} />
                    <div ref={setBottom} />
                    {currentMessages &&
                        currentMessages.map((msg, idx) => (
                            <ChatSingleMessage
                                msgReload={msgReload}
                                editMessageText={editMessage}
                                msg={msg}
                                key={msg?._id}
                                messageID={msg?._id}
                            />
                        ))}
                    <ScrollButton />
                </div>

                {isMobile ? (
                    <div className={styles.InputMobile}>
                        <ChatInput
                            selectedEdit={editMessageObj}
                            isReply={false}
                            replyOwner={selectedReplyOwner}
                            topicInputs={topicInputs}
                            setTopicInputs={setTopicInputs}
                        ></ChatInput>
                    </div>
                ) : (
                    <div className={styles.InputDesktop}>
                        <DumbChatInput
                            selectedEdit={editMessageObj}
                            Inputs={conversationInputs}
                            setInputs={setConversationInputs}
                            selectedInputID={selectedConversation?._id}
                            sendMessagge={sumbitMessageHandler}
                        ></DumbChatInput>
                    </div>
                )}
            </div>
        </>
    );
};
