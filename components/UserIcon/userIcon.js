import styles from './UserIcon.module.scss'

const UserIcon = ({ id, img, name, showName = true, size = 'regular' }) => {
  return (
    <>
      <span
        className={`${styles.userIconWrapper} ${
          size === 'small' ? styles.userIconSmall : styles.userIconRegular
        }`}
      >
        {img ? (
          <img className={styles.userIconImage} src={img} />
        ) : (
          <span className={styles.userIconImage} src={img} />
        )}
        {showName ? <span className={styles.userIconName}>{name}</span> : null}
      </span>
    </>
  )
}

export default UserIcon
