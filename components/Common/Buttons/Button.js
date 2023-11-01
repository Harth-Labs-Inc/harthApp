import styles from "./Buttons.module.scss";

export const Button = (props) => {
  const {
    text,
    isDisabled = false,
    fullWidth = false,
    tier = "primary",
    textLabel, // required if no text is passed
    className,
    onClick,
    type = "button",
    size = "large",
    isLoading = false,
    //forcedColor = "#404049",
  } = props;

  /* eslint-disable */

  return (
    <button
      //style={{ background: forcedColor ? forcedColor : "" }}
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
