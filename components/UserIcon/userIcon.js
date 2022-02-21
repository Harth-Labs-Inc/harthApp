import styles from './UserIcon.module.scss'

const UserIcon = ({ id, img, name }) => {
  return (
    <>
      {img ? (
        <span className={styles.userIconWrapper}>
          <img className={styles.userIconImage} src={img} />
          <span className={styles.userIconName}>{name}</span>
        </span>
      ) : (
        <span className={styles.userIconWrapper}>
          <span className={styles.userIconImage} src={img} />
          <span className={styles.userIconName}>{name}</span>
        </span>
      )}
    </>
  )
}

export default UserIcon
