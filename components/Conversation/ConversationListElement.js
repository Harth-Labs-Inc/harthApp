import { useState } from "react";

import styles from "./conversation.module.scss";

const ConversationListElement = (props) => {
  const {
    clickHandler,
    isMobile = false,
    hasAlert = false,
    isActive = false,
    conversation,
    label,
  } = props;

  const [buttonState, setButtonState] = useState(isActive);
  const [alertState, setAlertState] = useState(hasAlert);

  const toggleActive = () => {
    if (!buttonState) {
      setButtonState(true);
      setAlertState(false);
    } else {
      setButtonState(false);
    }
    clickHandler(conversation);
  };

  return (
    <>
      <button
        key={conversation._id}
        title={label}
        id={conversation._id}
        className={`
                    ${styles.conversation} 
                    ${isMobile && styles.conversationMobile} 
                    ${
                      isActive
                        ? styles.conversationActive
                        : styles.conversationInActive
                    } 
                    ${hasAlert && styles.conversationAlert} 
                    `}
        onClick={toggleActive}
      >
        {conversation.users?.map((e) => (
          <div key={e.userId} className={styles.participantElement}>
            <img
              className={`
                                ${styles.avatar} 
                                ${isMobile && styles.avatarMobile} 
                                `}
              src={e.iconKey}
              loading="lazy"
            />
            <div className={styles.label}>{e.name}</div>
          </div>
        ))}
      </button>
    </>
  );
};

export default ConversationListElement;

// import { useState } from "react";

// import styles from "./conversation.module.scss";

// const ConversationListElement = (props) => {
//     const {
//         onClick,
//         isMobile = false,
//         hasAlert = false,
//         //currently the names and pictures are passed as an array of objects with the attributes of name, pic, and zindex (for stacking)
//         conversationProfiles =[
//             {name: "themadchiller",  pic: "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png"},
//             {name: "abuc", pic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"},
//             {name: "nightmode", pic: "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png"},
//             {name: "rend", pic: "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png"},
//             ],
//         isActive = false,

//     } = props;

//     const [buttonState, setButtonState] = useState(isActive);
//     const [alertState, setAlertState] = useState(hasAlert);

//     const toggleActive = () => {
//         if (!buttonState){
//             setButtonState(true);
//             setAlertState(false);
//             //onClick()
//         }
//         else{
//             setButtonState(false);
//         }
//     };

//     return (
//         <>
//             <button
//                 //id={conversation._id}
//                 className={`
//                     ${styles.conversation}
//                     ${isMobile && styles.conversationMobile}
//                     ${isActive && styles.conversationActive}
//                     ${hasAlert && styles.conversationAlert}
//                     `}
//                 onClick={toggleActive}
//                 //onMouseUp={toggleEditMenu}
//                 >
//                     <div className={`
//                         ${styles.indicatorBox}
//                         ${isActive && styles.indicatorBoxActive}
//                         `}
//                     >
//                         {/* array is parsed  */}
//                         {conversationProfiles.map(e => (
//                             <div className={styles.participantElement} >
//                                 <img className={`
//                                     ${styles.avatar}
//                                     ${isMobile && styles.avatarMobile}
//                                     `}
//                                     src={e.pic}
//                                 />
//                                 <div className={styles.label}>{e.name}</div>
//                             </div>
//                         ))
//                         }

//                     </div>
//             </button>
//         </>
//     )
// }

// export default ConversationListElement;
