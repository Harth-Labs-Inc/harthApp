import styles from "./Buttons.module.scss";

/* eslint-disable */
export const Button = (props) => {
  const {
    text,
    isDisabled = false,
    fullWidth = false,
    tier = "primary",
    textLabel,
    className,
    onClick,
    type = "button",
    size = "large",
    isLoading = false,
  } = props;

  return (
    <button
      type={type}
      className={`
                ${styles.button} 
                ${
                  tier === "primary"
                    ? styles.buttonPrimary
                    : styles.buttonSecondary
                }
                ${size === "large" ? styles.buttonLarge : styles.buttonSmall} 
                ${fullWidth ? styles.buttonFullWidth : ""}
                ${className}
                ${isLoading && tier == "primary" ? styles.buttonLoading : null}
            `}
      disabled={isDisabled || isLoading}
      aria-label={textLabel}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
