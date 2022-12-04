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
            `}
            disabled={isDisabled}
            aria-label={textLabel}
            onClick={onClick}
        >
            {text}
        </button>
    );
};
