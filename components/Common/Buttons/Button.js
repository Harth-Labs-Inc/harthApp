import styles from './Button.module.scss'

export const Button = (props) => {
  const { disabled, fullWidth } = props

  const buttonClasses = () => {}

  return (
    <button
      className={`${styles.button} ${fullWidth ? styles.buttonFullWidth : ''}`}
      disabled={disabled}
      {...props}
    >
      {props.text}
    </button>
  )
}
