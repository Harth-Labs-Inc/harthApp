import { useForm } from "react-hook-form";

import ErrorMessage from "./ErrorMessage";
import styles from "./Input.module.scss";

export const Input = (props) => {
    const {
        name,
        title,
        isrequired,
        changeHandler,
        inputhandler,
        value,
        type,
        empty,
        data,
        errorData,
        matching,
        customError,
        placeholder,
    } = props;

    const inputChangeHandler = (e) => {
        const { name, value } = e.target;
        let tempErrorData = {
            ...errorData,
            [name]: false,
        };
        let tempData = {
            ...data,
            [name]: value,
        };
        changeHandler(tempErrorData, tempData);
    };

    return (
        <fieldset
            className={`${styles.inputComponent}
                    ${empty ? "content" : undefined}
                    ${matching ? "error_matching" : undefined}
                    ${isrequired ? "error_required" : undefined}
                    ${customError ? "error_custom" : undefined}`}
        >
            {title ? <label htmlFor={name}>{title}</label> : null}
            <input
                className="form-input"
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={inputChangeHandler}
                onInput={inputhandler}
                autoComplete="off"
                placeholder={placeholder}
                {...props}
            />
            <ErrorMessage
                isrequired={isrequired}
                matching={matching}
                customError={customError}
            />
        </fieldset>
    );
};
