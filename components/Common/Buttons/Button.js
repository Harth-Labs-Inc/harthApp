import styles from "./Button.module.scss";

export const Button = (props) => {
    const {
        text,
        disabled,
        fullWidth = false,
        tier = "primary",
        textLabel,
        className,
        onClick,
    } = props;

    const buttonClasses = () => {
        if (tier === "secondary") {
            return styles.buttonSecondary;
        } else if (tier === "tertiary") {
            return styles.buttonTertiary;
        }
        return styles.buttonPrimary;
    };

    return (
        <button
            className={`${styles.button} ${buttonClasses()} ${
                fullWidth ? styles.buttonFullWidth : ""
            } ${className}`}
            disabled={disabled}
            aria-label={textLabel}
            onClick={onClick}
        >
            {text}
        </button>
    );
};
