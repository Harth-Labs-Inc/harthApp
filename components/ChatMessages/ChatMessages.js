import { useState, useEffect, useRef, useContext } from "react";
import { useComms } from "../../contexts/comms";
import { useChat } from "../../contexts/chat";
import { useSocket } from "../../contexts/socket";
import { MobileContext } from "../../contexts/mobile";
import { getDownloadURL } from "../../requests/s3";
import ChatInput from "../ChatInput/ChatInput";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import styles from "./ChatMessages.module.scss";
import ImageViewer from "react-simple-image-viewer";

const MessageWrapper = () => {
    const [currentMessages, setCurrentMessages] = useState([]);
    // const [currentReplies, setCurrentReplies] = useState([]);
    const [topicInputs, setTopicInputs] = useState({});
    const [editMessageObj, setEditMessageObj] = useState({});
    const [bottom, setBottom] = useState(null);
    const [inview, setInview] = useState(null);
    const [displayScrollButton, setDisplayScrollButton] = useState(false);
    const [msgReload, triggerMsgReload] = useState(0);
    const [showImageSlideShow, setShowImageSlideShow] = useState(false);
    const [imageSlideshowURL, setImageSlideshowURL] = useState();

    const bottomObserver = useRef(null);
    const { messages, setMessages, selectedReplyOwner } = useChat();
    const { selectedTopic } = useComms();
    const {
        incomingMsg,
        incomingMsgUpdate,
        unreadMessagesRef,
        setUnreadMessagesRef,
    } = useSocket();

    const messagesEndRef = useRef(null);
    const { isMobile } = useContext(MobileContext);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (entry.isIntersecting) {
                    setInview(true);
                    setDisplayScrollButton(false);
                } else {
                    setInview(false);
                }
            },
            { threshold: 0.25, rootMargin: "50px" }
        );
        bottomObserver.current = observer;
    }, []);

    useEffect(() => {
        const observer = bottomObserver.current;
        if (bottom) {
            observer.observe(bottom);
        }
        return () => {
            if (bottom) {
                observer.unobserve(bottom);
            }
        };
    }, [bottom]);

    useEffect(() => {
        if (messages && selectedTopic) {
            let tempMsgs = [...(messages[selectedTopic._id] || [])];

            if (unreadMessagesRef.length && tempMsgs && tempMsgs.length) {
                let filteredUnread = unreadMessagesRef.filter(
                    (msg) => msg.topic_id !== selectedTopic._id
                );

                setUnreadMessagesRef(filteredUnread);
            }
            if (inview) {
                scrollToBottom("smooth");
            } else {
                setDisplayScrollButton(true);
            }
            setCurrentMessages(tempMsgs);
        }
    }, [selectedTopic, messages]);

    useEffect(() => {
        if (incomingMsg && messages) {
            const { topic_id, owner_id } = incomingMsg;
            if (owner_id) {
                let tempMsgs = messages[topic_id];
                if (tempMsgs && topic_id) {
                    let index;
                    tempMsgs.forEach((msg, idx) => {
                        if (msg._id === owner_id) {
                            index = idx;
                        }
                        if (index) {
                            tempMsgs[index].replies = [
                                ...new Set([
                                    ...tempMsgs[index].replies,
                                    incomingMsg._id,
                                ]),
                            ];
                        }
                        setMessages({
                            ...messages,
                            [topic_id]: tempMsgs,
                        });
                    });
                }
            } else {
                let tempMsgs = messages[topic_id];
                if (tempMsgs && topic_id) {
                    let msgs = [incomingMsg, ...tempMsgs];
                    setMessages({
                        ...messages,
                        [topic_id]: msgs,
                    });
                }
            }
        }
    }, [incomingMsg]);

    useEffect(() => {
        if (incomingMsgUpdate && messages) {
            const { topic_id, action, _id } = incomingMsgUpdate;

            let tempMsgs = messages[topic_id];
            if (tempMsgs && topic_id) {
                if (action == "delete") {
                    let filteredMsgs = tempMsgs.filter(
                        (msg) => msg._id !== _id
                    );
                    setMessages({
                        ...messages,
                        [topic_id]: filteredMsgs,
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
                                incomingMsgUpdate.reactions;
                            tempMsgs[index].flames = incomingMsgUpdate.flames;
                            tempMsgs[index].message = incomingMsgUpdate.message;
                        }
                        setMessages({
                            ...messages,
                            [topic_id]: tempMsgs,
                        });
                    });
                }
                triggerMsgReload((prevState) => (prevState += 1));
            }
        }
    }, [incomingMsgUpdate]);

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
    const openImageSlideShow = async (idx, attachments) => {
        let att = attachments[idx];
        let name = { ...att }?.name || "";
        if (name.includes("thumbnail")) {
            name = name.replace("thumbnail", "full");
        }
        const data = await getDownloadURL(
            name,
            att.fileType,
            "topic-message-attachments"
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
    const resetEdit = () => {
        setEditMessageObj({});
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
                                resetEdit={resetEdit}
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
                            resetEdit={resetEdit}
                        ></ChatInput>
                    </div>
                ) : (
                    <div className={styles.InputDesktop}>
                        <ChatInput
                            selectedEdit={editMessageObj}
                            isReply={false}
                            replyOwner={selectedReplyOwner}
                            topicInputs={topicInputs}
                            setTopicInputs={setTopicInputs}
                            resetEdit={resetEdit}
                        ></ChatInput>
                    </div>
                )}
            </div>
        </>
    );
};

export default MessageWrapper;

// import { useState, useEffect, useRef, useContext } from "react";
// import { useComms } from "../../contexts/comms";
// import { useChat } from "../../contexts/chat";
// import { useSocket } from "../../contexts/socket";
// import { MobileContext } from "../../contexts/mobile";

// import ChatInput from "../ChatInput/ChatInput";
// import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";

// import styles from "./ChatMessages.module.scss";

// const MessageWrapper = () => {
//     const [currentMessages, setCurrentMessages] = useState([]);
//     const [currentReplies, setCurrentReplies] = useState([]);
//     const [topicInputs, setTopicInputs] = useState({});
//     const [editMessageObj, setEditMessageObj] = useState({});
//     const [bottom, setBottom] = useState(null);
//     const [inview, setInview] = useState(null);
//     const [displayScrollButton, setDisplayScrollButton] = useState(false);
//     const bottomObserver = useRef(null);
//     const { messages, setMessages, replies, setReplies, selectedReplyOwner } =
//         useChat();
//     const { selectedTopic } = useComms();
//     const { incomingMsg, unreadMsgs, setUnreadMsgs, incomingMsgUpdate } =
//         useSocket();

//     const messagesEndRef = useRef(null);
//     const { isMobile } = useContext(MobileContext);

//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 const entry = entries[0];

//                 if (entry.isIntersecting) {
//                     console.log("in view");
//                     setInview(true);
//                     setDisplayScrollButton(false);
//                 } else {
//                     console.log("out of view");
//                     setInview(false);
//                 }
//             },
//             { threshold: 0.25, rootMargin: "50px" }
//         );
//         bottomObserver.current = observer;
//     }, []);

//     useEffect(() => {
//         const observer = bottomObserver.current;
//         if (bottom) {
//             observer.observe(bottom);
//         }
//         return () => {
//             if (bottom) {
//                 observer.unobserve(bottom);
//             }
//         };
//     }, [bottom]);

//     useEffect(() => {
//         if (messages && selectedTopic) {
//             let tempMsgs = [...(messages[selectedTopic._id] || [])];
//             if (unreadMsgs.length && tempMsgs && tempMsgs.length) {
//                 let readIds = [];
//                 unreadMsgs.forEach((msg) => {
//                     if (msg.topic_id == selectedTopic._id) {
//                         readIds.push(msg._id);
//                     }
//                 });

//                 let tempUnread = unreadMsgs.filter(
//                     (msg) => !readIds.includes(msg._id)
//                 );
//                 setUnreadMsgs(tempUnread);
//             }
//             if (inview) {
//                 scrollToBottom("smooth");
//             } else {
//                 setDisplayScrollButton(true);
//             }
//             setCurrentMessages(tempMsgs);
//         }
//     }, [selectedTopic, messages]);

//     useEffect(() => {
//         if (incomingMsg && messages) {
//             const { topic_id, owner_id } = incomingMsg;
//             if (owner_id) {
//                 let tempReplyObj = {};
//                 let tempReplies = replies[owner_id];
//                 if (tempReplies) {
//                     let msgs = [...tempReplies, incomingMsg];
//                     tempReplyObj = { ...replies, [owner_id]: msgs };
//                     for (let [owner, arr] of Object.entries(
//                         tempReplyObj || []
//                     )) {
//                         arr.forEach((rply) => {
//                             if (rply._id == owner_id) {
//                                 let index;
//                                 let temp = tempReplyObj[owner];
//                                 temp.forEach((msg, idx) => {
//                                     if (msg._id === owner_id) {
//                                         index = idx;
//                                     }
//                                     if (index) {
//                                         temp[index].replies = [
//                                             ...new Set([
//                                                 ...temp[index].replies,
//                                                 incomingMsg._id,
//                                             ]),
//                                         ];
//                                     }
//                                     tempReplyObj[owner] = temp;
//                                 });
//                             }
//                         });
//                     }
//                     setReplies(tempReplyObj);
//                 }
//                 let tempMsgs = messages[topic_id];
//                 if (tempMsgs && topic_id) {
//                     let index;
//                     tempMsgs.forEach((msg, idx) => {
//                         if (msg._id === owner_id) {
//                             index = idx;
//                         }
//                         if (index) {
//                             tempMsgs[index].replies = [
//                                 ...new Set([
//                                     ...tempMsgs[index].replies,
//                                     incomingMsg._id,
//                                 ]),
//                             ];
//                         }
//                         setMessages({
//                             ...messages,
//                             [topic_id]: tempMsgs,
//                         });
//                     });
//                 }
//             } else {
//                 let tempMsgs = messages[topic_id];
//                 if (tempMsgs && topic_id) {
//                     let msgs = [incomingMsg, ...tempMsgs];
//                     setMessages({
//                         ...messages,
//                         [topic_id]: msgs,
//                     });
//                 }
//             }
//         }
//     }, [incomingMsg]);

//     useEffect(() => {
//         if (incomingMsgUpdate && messages) {
//             const { topic_id, action, _id, owner_id } = incomingMsgUpdate;
//             if (owner_id) {
//                 let tempReplies = replies[owner_id];
//                 if (tempReplies) {
//                     if (action == "delete") {
//                         let filteredReplies = tempReplies.filter(
//                             (msg) => msg._id !== _id
//                         );
//                         setReplies({ ...replies, [owner_id]: filteredReplies });
//                     }
//                     if (action == "update") {
//                         let index;
//                         tempReplies.forEach((msg, idx) => {
//                             if (msg._id === _id) {
//                                 index = idx;
//                             }
//                             if (tempReplies[index]) {
//                                 tempReplies[index].reactions =
//                                     incomingMsgUpdate.reactions;
//                                 tempReplies[index].flames =
//                                     incomingMsgUpdate.flames;
//                                 tempReplies[index].message =
//                                     incomingMsgUpdate.message;
//                                 tempReplies[index].replies =
//                                     incomingMsgUpdate.replies;
//                             }
//                             setReplies({ ...replies, [owner_id]: tempReplies });
//                         });
//                     }
//                 }
//             } else {
//                 let tempMsgs = messages[topic_id];
//                 if (tempMsgs && topic_id) {
//                     if (action == "delete") {
//                         let filteredMsgs = tempMsgs.filter(
//                             (msg) => msg._id !== _id
//                         );
//                         setMessages({
//                             ...messages,
//                             [topic_id]: filteredMsgs,
//                         });
//                     }
//                     if (action == "update") {
//                         let index;
//                         tempMsgs.forEach((msg, idx) => {
//                             if (msg._id === _id) {
//                                 index = idx;
//                             }
//                             if (tempMsgs[index]) {
//                                 tempMsgs[index].reactions =
//                                     incomingMsgUpdate.reactions;
//                                 tempMsgs[index].flames =
//                                     incomingMsgUpdate.flames;
//                                 tempMsgs[index].message =
//                                     incomingMsgUpdate.message;
//                             }
//                             setMessages({
//                                 ...messages,
//                                 [topic_id]: tempMsgs,
//                             });
//                         });
//                     }
//                 }
//             }
//         }
//     }, [incomingMsgUpdate]);

//     useEffect(() => {
//         if (replies && selectedReplyOwner) {
//             let tempReplies = [...(replies[selectedReplyOwner._id] || [])];

//             setCurrentReplies(tempReplies);
//         }
//     }, [replies, selectedReplyOwner]);

//     const editMessage = (msg) => {
//         setEditMessageObj(msg);
//     };
//     const scrollToBottom = () => {
//         messagesEndRef.current.scrollIntoView({
//             behavior: "smooth",
//             block: "start",
//         });
//     };
//     const ScrollButton = () => {
//         if (displayScrollButton) {
//             return (
//                 <button onClick={scrollToBottom} className="scroll-to-bottom">
//                     New Message
//                 </button>
//             );
//         }
//         return null;
//     };

//     const selectedReplyOwnerLength = () => {
//         let length = 0;
//         if (selectedReplyOwner) {
//             length = Object.keys(selectedReplyOwner).length;
//         }

//         return length;
//     };

//     return (
//         <>
//         <div className={styles.Holder}>
//             <div
//                 id={styles.ChatMessages}
//             >
//                 <div ref={messagesEndRef} />
//                 <div ref={setBottom} />
//                 {selectedReplyOwnerLength > 0
//                     ? [selectedReplyOwner, ...(currentReplies || [])].map(
//                           (msg) => (
//                               <ChatSingleMessage
//                                   editMessageText={editMessage}
//                                   msg={msg}
//                                   key={msg?._id}
//                                   isReply={true}
//                               />
//                           )
//                       )
//                     : currentMessages &&
//                       currentMessages.map((msg, idx) => (
//                           <ChatSingleMessage
//                               editMessageText={editMessage}
//                               msg={msg}
//                               key={msg?._id}
//                               messageID={msg?._id}
//                           />
//                       ))}
//                 <ScrollButton />
//             </div>

//             {isMobile ? (
//                 <div className={styles.InputMobile}>
//                     <ChatInput
//                         selectedEdit={editMessageObj}
//                         isReply={selectedReplyOwnerLength > 0}
//                         replyOwner={selectedReplyOwner}
//                         topicInputs={topicInputs}
//                         setTopicInputs={setTopicInputs}
//                     ></ChatInput>
//                 </div>
//                 ) : (
//                 <div className={styles.InputDesktop}>
//                     <ChatInput
//                         selectedEdit={editMessageObj}
//                         isReply={selectedReplyOwnerLength > 0}
//                         replyOwner={selectedReplyOwner}
//                         topicInputs={topicInputs}
//                         setTopicInputs={setTopicInputs}
//                     ></ChatInput>
//                 </div>
//                 )
//             }
//         </div>
//         </>
//     );
// };

// export default MessageWrapper;
