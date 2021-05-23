import { useRef, useState } from "react";

const Input = (props) => {
  const labelEl = useRef(null);
  const {
    name,
    title,
    isRequired,
    placeholder,
    changeHandler,
    value,
    type,
    empty,
    data,
    errorData,
    matching,
    customError,
    changePage,
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

  const ErrorMessage = () => {
    if (type === "password") {
      return (
        <p className="password_error_message">
          <a
            onClick={() => {
              changePage("resetpwd");
            }}
          >
            Forgot your password?
          </a>
        </p>
      );
    } else if (customError) {
      return (
        <p className="custom_error_message">{customError ? customError : ""}</p>
      );
    } else {
      return (
        <p className="empty_error_message">
          {isRequired ? "Field Required" : ""}
        </p>
      );
    }
  };

  return (
    <>
      <fieldset
        className={`${empty ? "content" : ""} 
                    ${matching ? "error_matching" : ""} 
                    ${isRequired ? "error_required" : ""} 
                    ${customError ? "error_custom" : ""}`}
      >
        <label htmlFor={name} className="form-label" ref={labelEl}>
          {title}
        </label>
        <input
          className="form-input"
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={inputChangeHandler}
          placeholder={placeholder}
          autoComplete="off"
          {...props}
        />
        <ErrorMessage />
      </fieldset>
    </>
  );
};

export default Input;
