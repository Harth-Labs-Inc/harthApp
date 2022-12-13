import { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import { useChat } from "./chat";
import { getTopics } from "../requests/community";

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
    const { selectedTopic, setTopics, setSelectedTopic } = useComms();

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
        if (socket && user?.comms) {
            join([...(user.comms || [])], (err, status) => {
                let { ok } = status;
                if (ok) {
                    console.log("connected");
                }
            });

            socket.on("error", function (err) {
                console.log("received socket error:");
                console.log(err);
            });

            socket.on(
                "new update",
                async ({ updateType, ...incomingUpdate }) => {
                    console.log(updateType, incomingUpdate);
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
                            console.log(incomingUpdate);
                            let deleteResult = getTopics(
                                incomingUpdate?.comm?._id,
                                user._id
                            );
                            deleteResult.then(({ topics }) => {
                                console.log(topics, "iiiiiiiiii");
                                if (topics) {
                                    console.log(
                                        "deeeeeeeeeeeeeeeeeeeeellllllllllleeeeeeeeeeeeeeeeeeetttttttte",
                                        deleteResult
                                    );

                                    console.log(activeTopic, "active topic");
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
                            console.log(editResult, activeTopic);
                            setTopics(editResult.topics);
                            break;

                        case "new room":
                            setIncomingRoom(incomingUpdate);
                            break;

                        case "room update":
                            setIncomingRoomUpdate(incomingUpdate);
                            break;

                        default:
                            break;
                    }
                }
            );
        }
    }, [socket, user]);

    const join = (chatroomName, cb) => {
        socket.emit("joinRooms", chatroomName, cb);
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
