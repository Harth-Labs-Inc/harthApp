import { createContext, useState, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import { useChat } from "./chat";
import { getTopics } from "../requests/community";
import { getConversations } from "../requests/conversations";

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [incomingMsg, setIncomingMsg] = useState({});
    const [incomingMsgUpdate, setIncomingMsgUpdate] = useState({});
    const [incomingRoomUpdate, setIncomingRoomUpdate] = useState({});
    const [incomingTopic, setIncomingTopic] = useState({});
    const [incomingRoom, setIncomingRoom] = useState({});
    const [unreadMsg, setUnreadMsg] = useState({});
    const [unreadMsgs, setUnreadMsgs] = useState([]);

    const { user } = useAuth();
    const {
        selectedTopic,
        setTopics,
        setSelectedTopic,
        comms,
        setComm,
        refetchComms,
        selectedcomm,
        setConversations,
        setUnreadConversationMessagesHandler,
    } = useComms();

    const selectedHarthRef = useRef();

    useEffect(() => {
        if (user) {
            let urls = {
                development: "http://localhost:3030",
                production: "https://project-blarg-socket.herokuapp.com",
            };
            setSocket(
                io.connect(urls[process.env.NODE_ENV], {
                    transports: ["websocket"],
                })
            );
        }
    }, [user]);

    useEffect(() => {
        if (selectedcomm) {
            selectedHarthRef.current = selectedcomm;
        }
    }, [selectedcomm]);

    useEffect(() => {
        if (socket && user && comms) {
            join([...(comms || [])]);

            socket.on("error", function (err) {});

            socket.on(
                "new update",
                async ({ updateType, ...incomingUpdate }) => {
                    let activeTopic = JSON.parse(
                        localStorage.getItem("selected_topic")
                    );
                    switch (updateType) {
                        case "new message":
                            setIncomingMsg(incomingUpdate);
                            if (
                                incomingUpdate.topic_id !==
                                (selectedTopic || {})._id
                            ) {
                                setUnreadMsg(incomingUpdate);
                                setUnreadMsgs([...unreadMsgs, incomingUpdate]);
                            }
                            break;
                        case "message update":
                            setIncomingMsgUpdate(incomingUpdate);
                            break;
                        case "new topic":
                            let newTopicResult = await getTopics(
                                incomingUpdate?.comm_id,
                                user._id
                            );
                            setTopics(newTopicResult.topics);
                            break;
                        case "topic deleted":
                            let deleteResult = getTopics(
                                incomingUpdate?.comm?._id,
                                user._id
                            );
                            deleteResult.then(({ topics }) => {
                                if (topics) {
                                    if (
                                        activeTopic?._id ===
                                        incomingUpdate?.topic?._id
                                    ) {
                                        setSelectedTopic(topics[0]);
                                    }
                                    setTopics(topics);
                                }
                            });

                            break;
                        case "topic edited":
                            console.log("topic was updated");
                            let editResult = await getTopics(
                                incomingUpdate?.comm?._id,
                                user._id
                            );

                            editResult?.topics
                                ?.filter(Boolean)
                                .forEach((topic) => {
                                    if (topic?._id === activeTopic?._id) {
                                        setSelectedTopic(topic);
                                    }
                                });
                            console.log(editResult);
                            setTopics(editResult.topics);
                            break;
                        case "harth edited":
                            console.log("harth was updated");
                            refetchComms(incomingUpdate?.comm);
                            break;
                        case "harth deleted":
                            refetchComms();

                            break;
                        case "selected harth reload":
                            if (
                                incomingUpdate?.comm._id ==
                                selectedHarthRef?.current?._id
                            ) {
                                setComm(incomingUpdate?.comm);
                            }
                            break;
                        case "selected user reload":
                            if (
                                incomingUpdate?.comm?.selectedUserID ==
                                user?._id
                            ) {
                                refetchComms();
                            }

                            break;
                        case "new room":
                            setIncomingRoom(incomingUpdate);
                            break;
                        case "room update":
                            setIncomingRoomUpdate(incomingUpdate);
                            break;
                        case "new conversation":
                            let isForYou = incomingUpdate.users?.find(
                                (usr) => usr.userId == user._id
                            );
                            if (isForYou) {
                                let newConversationsResult =
                                    await getConversations(
                                        incomingUpdate?.harthId,
                                        user._id
                                    );
                                setConversations(
                                    newConversationsResult.conversations
                                );
                            }
                            break;
                        case "new conversation message":
                            setUnreadConversationMessagesHandler(
                                incomingUpdate
                            );

                            break;
                        default:
                            break;
                    }
                }
            );
        }
    }, [socket, comms, user]);

    const join = async (topics) => {
        let promises = [];
        for (let { _id } of topics) {
            promises.push(
                new Promise((resolve) => {
                    socket.emit("joinRooms", _id, () => resolve(true));
                })
            );
        }
        await Promise.all(promises);
        return;
    };
    const leave = (chatroomName, cb) => {
        socket.emit("leave", chatroomName, cb);
    };
    const emitUpdate = (chatroomName, update, cb) => {
        socket.emit("Update", chatroomName, update, cb);
    };

    return (
        <SocketContext.Provider
            value={{
                emitUpdate,
                incomingMsgUpdate,
                incomingTopic,
                incomingMsg,
                incomingRoom,
                incomingRoomUpdate,
                unreadMsg,
                unreadMsgs,
                setUnreadMsgs,
                join,
                leave,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
