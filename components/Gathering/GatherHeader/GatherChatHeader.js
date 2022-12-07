
import { BackButtonMobile } from "../Controls/BackButtonMobile";

import styles from './gatherHeader.module.scss';


const GatherChatHeader = (props) => {
  const { onClick } = props


  const goBack = () => {
    //does nothing
    //return to previous page
    onClick();
  };


  return (
    <>
    <div className={styles.chatHeader}>
      <BackButtonMobile onClick={goBack}/>
        gathering chat
      <div className={styles.rightSpacer} />
    </div>
    </>
  )
}

export default GatherChatHeader

