import { useContext, useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'

import TopicsSideNav from '../../../components/TopicsSideNav'
import TopicsMenu from '../../../components/TopicsMenu'
import ChatMessages from '../../../components/ChatMessages/ChatMessages'
import TopicEditPanel from '../../../components/Topics/TopicEditPanel/TopicEditPanel'
import { useSocket } from '../../../contexts/socket'
import { useComms } from '../../../contexts/comms'
import { MobileContext } from '../../../contexts/mobile.js'
import GatherHeader from '../../../components/Gathering/GatherHeader/GatherHeader'
import GatherChatHeader from '../../../components/Gathering/GatherHeader/GatherChatHeader'
import ProfileContainer from '../../../components/Gathering/ProfileContainer/ProfileContainer'
import ReactSlider from 'react-slider';
import GatherControlBar from "../../../components/Gathering/GatherControlBar/GatherControlBar"
import TopicListElement from '../../../components/Topics/TopicListElement'

import { Dice } from '../../../components/Gathering/Dice/Dice'
import { DiceButton } from '../../../components/Gathering/Controls/DiceButton'
import { DiceBar } from '../../../components/Gathering/GatherTools/DiceBar'
import { DiceAlert } from '../../../components/Gathering/GatherTools/DiceAlert'
import { MapButton } from '../../../components/Gathering/Controls/MapButton'
import ConversationListElement from '../../../components/Conversation/ConversationListElement'



const Chat = (prop) => {
  const { topicChange } = useComms()
  const { isMobile } = useContext(MobileContext)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)




  useEffect(() => {
    if (isMobile && topicChange) {
      setChatVisible(true)
    } else {
      setChatVisible(false)
    }
  }, [topicChange])

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel)
  }

  const topicChatClasses = () => {
    const classes = []
    if (showEditPanel) {
      classes.push('topic-edit-active')
    }
    if (isMobile && chatVisible) {
      classes.push('chatVisible')
    }
    return classes.join(' ')
  }

  const toggleMobileMenu = () => {
    setChatVisible((prevState) => !prevState)
  }

  const TopicPanel = () => {
    return showEditPanel ? (
      <TopicEditPanel togglePanel={toggleEditPanel} />
    ) : null
  }


  const users = [
  {name: "themadchiller", pic: "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png"},
  {name: "abuc", pic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"},
  {name: "nightmode", pic: "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png"},
  {name: "rend", pic: "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png"},
  ];
  const profileIcon1 =
  "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png";

  const profileIcon2 =
  "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png";

  const profileIcon3 =
  "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png";

  const profileIcon4 =
  "https://w7.pngwing.com/pngs/853/421/png-transparent-dwayne-johnson-desktop-high-definition-television-professional-wrestler-4k-resolution-dwayne-johnson-tshirt-hand-fitness-professional.png";


  const pics = [profileIcon1, profileIcon2, profileIcon3, profileIcon4];
  const names = ["themadchiller", "abuc", "sherwell", "nightmode"];

  return (
    <>
    {isMobile 
      ? null 
      : <TopicsSideNav />
    }     
      <section id="topic_active" className={topicChatClasses()} style={{backgroundColor:"white"}}>  
      {/* "#2F1D2A" */}
        <TopicsMenu
          on_toggle_panel={toggleEditPanel}
          toggleMobileMenu={toggleMobileMenu}
        />

        <div id="topic_messages_container" >
        
        <div style={{display: "flex", rowGap: 16, flexDirection: "column"}}>
        {/* <div style={{display: "flex", columnGap: 16, flexDirection: "row"}}>

            <div style={{width: 120, height: 120,}}>
            <ProfileContainer />
            </div>
            <div style={{width: 240, height: 240,}}>
            <ProfileContainer />
            </div>
            <div style={{width: 360, height: 360,}}>
            <ProfileContainer />
            </div>
        </div> */}
        
        {/* <div style={{display: "flex", columnGap: 16, flexDirection: "row"}}>
        <ConversationListElement conversationProfiles={users} />
        <ConversationListElement conversationProfiles={users} isMobile={true}/>
        </div>

        <div style={{display: "flex", columnGap: 16, flexDirection: "row"}}>
        <TopicListElement alertProfiles={pics} isMobile={true}/>
        <TopicListElement alertProfiles={pics}/>
        </div> */}

        <div style={{display:"flex", flexDirection:"row", columnGap:12}}>

        <DiceAlert profileImage={profileIcon1} rollResult={20} dice={20}/>

        <DiceAlert profileImage={profileIcon1} rollResult={11} dice={12}/>

        <DiceAlert profileImage={profileIcon1} rollResult={7} dice={10}/>
        </div>



        <div style={{display:"flex", flexDirection:"row", columnGap:12}}>
        <DiceAlert profileImage={profileIcon1} rollResult={5} dice={8}/>

        <DiceAlert profileImage={profileIcon1} rollResult={3} dice={6}/>


        <DiceAlert profileImage={profileIcon1} rollResult={1} dice={4}/>
        </div>


        <div style={{width: 375,}} >
        <DiceBar type="mobile" />
        </div>

        <DiceBar />




        </div>
               

          <ChatMessages />
        </div>
      </section>
      <CSSTransition
        in={showEditPanel}
        timeout={0}
        classNames="topicPanelAnimation"
      >
        <TopicPanel />
      </CSSTransition>
    </>
  )
}

export default Chat
