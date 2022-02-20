import styles from './BackButton.module.scss'

export const BackButton = (props) => {
  const { textLabel } = props
  return (
    <button
      className={styles.backButton}
      aria-label={textLabel}
      {...props}
    ></button>
  )
}
