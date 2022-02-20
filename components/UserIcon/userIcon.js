import styles from './UserIcon.module.scss'

const UserIcon = ({ id, img, name, clickHandler, data }) => {
  return (
    <button
      onClick={() => {
        clickHandler(data)
      }}
      aria-label={name}
      className={`${styles.userIcon} ${img ? 'hasImage' : undefined}`}
      title={name}
    >
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
    </button>
  )
}

export default UserIcon
