import styles from "./avatar.module.scss";


export const Avatar = (props) => {
  const {
    isPressable,
    onPress,
    picSize = 40,
    imageSrc,// = require("../../../public/svgs/profileIcon")
    aLabel = "Profile Image",
  } = props;


  return (
    <>
    {isPressable 
      ?
        <button
        onClick={onPress}
        className={styles.avatarButton}
        aria-label={aLabel}
        >
          <img src={imageSrc} aria-label="Profile Image" className={styles.avatar} height={picSize} width={picSize}/>
        </button>
      :
      <div className={styles.avatarIndicator}>
        <img src={imageSrc} aria-label="Profile Image" className={styles.avatar} height={picSize} width={picSize}/>
      </div>
    }
    </>
  )
}
