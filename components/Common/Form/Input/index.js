import React, { useEffect, useRef } from "react";
import ErrorMessage from "./../../Input/ErrorMessage";

export default function FormInput(props) {
    const {
        id,
        name,
        isrequired,
        changeHandler,
        value,
        type,
        placeholder,
        badData,
    } = props;

    const inputRef = useRef(null);

    useEffect(() => {
        console.log("changes", inputRef.current);
    }, [inputRef.current]);
    return (
        <>
            <label htmlFor={name}>{name}</label>
            <input
                ref={inputRef}
                className="form-input"
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={changeHandler}
                autoComplete="off"
                placeholder={placeholder}
                data-isrequired={isrequired}
                {...props}
            />
            <ErrorMessage errorMsg="" />
        </>
    );
}
