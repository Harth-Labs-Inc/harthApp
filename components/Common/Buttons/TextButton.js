import styles from './button.module.scss'

export const TextButton = (props) => {
  return (
    <button className={styles.textButton} {...props}>
      {props.text}
    </button>
  )
}
