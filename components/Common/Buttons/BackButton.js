import styles from './button.module.scss'

export const BackButton = (props) => {
  const { textLabel, buttonClass, onClick } = props
  return (
    <button
      className={`${styles.backButton} ${buttonClass}`}
      aria-label={textLabel}
      onClick={onClick}
    ></button>
  )
}
