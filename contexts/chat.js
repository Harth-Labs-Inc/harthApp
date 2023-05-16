import { createContext, useContext } from "react";
// import { useComms } from "./comms";
// import { getMessagesByTopic, getRepliesByOwner } from "../requests/chat";
// import { getRepliesByOwner } from "../requests/chat";

const ChatContext = createContext({});

export const ChatProvider = ({ children }) => {
    // const [messages, setMessages] = useState({});
    // const { selectedTopic } = useComms();
    // const [replies, setReplies] = useState({});
    // const [selectedReplyOwner, setSelectedReplyOwner] = useState({});

    // useEffect(() => {
    //   if (selectedTopic && selectedTopic._id) {
    //     messages[selectedTopic._id] = [];
    //     (async () => {
    //       let data = await getMessagesByTopic(selectedTopic._id);
    //       const { ok, fetchResults } = data;
    //       if (ok) {
    //         setMessages({
    //           ...messages,
    //           [selectedTopic._id]: sortMessages(fetchResults),
    //         });
    //       }
    //     })();
    //   } else {
    //     setMessages({});
    //   }
    // }, [selectedTopic]);

    // useEffect(() => {
    //     if (selectedReplyOwner && selectedReplyOwner._id) {
    //         if (!(selectedReplyOwner._id in replies)) {
    //             messages[selectedReplyOwner._id] = [];
    //             (async () => {
    //                 let data = await getRepliesByOwner(selectedReplyOwner._id);

    //                 const { ok, fetchResults } = data;
    //                 if (ok) {
    //                     setReplies({
    //                         ...replies,
    //                         [selectedReplyOwner._id]: fetchResults,
    //                     });
    //                 }
    //             })();
    //         }
    //     }
    // }, [selectedReplyOwner]);

    // const sortMessages = (msgs) => {
    //     return msgs
    //         .sort((a, b) => new Date(a.date) - new Date(b.date))
    //         .reverse();
    // };
    // const refreshTopicsChatIcon = async (id, userID, newIconKey) => {
    //     let elements = document.getElementsByClassName(`${id}_${userID}`);
    //     for (let imgELement of elements) {
    //         imgELement.setAttribute("src", newIconKey);
    //     }
    // };
    // const refreshTopicsChatName = async (id, userID, newName) => {
    //     let elements = document.getElementsByClassName(`${id}_${userID}_name`);
    //     for (let nameElement of elements) {
    //         nameElement.innerHTML = newName;
    //     }
    // };
    // const resetChats = () => {
    //     setMessages({});
    // };

    return (
        <ChatContext.Provider
            value={
                {
                    // messages,
                    // setMessages,
                    // setSelectedReplyOwner,
                    // replies,
                    // setReplies,
                    // selectedReplyOwner,
                    // refreshTopicsChatIcon,
                    // refreshTopicsChatName,
                    // resetChats,
                }
            }
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
