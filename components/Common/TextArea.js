import { useEffect, useRef, useState } from "react";

const TextArea = (props) => {
  const {
    name,
    title,
    isRequired,
    changeHandler,
    value,
    type,
    empty,
    data,
    errorData,
    matching,
    customError,
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
    <>
      <fieldset
        className={`${empty ? "content" : undefined} ${
          matching ? "error_matching" : undefined
        } ${isRequired ? "error_required" : undefined} ${
          customError ? "error_custom" : undefined
        }`}
      >
        <textarea
          className="form-input"
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={inputChangeHandler}
          placeholder={title}
          autoComplete="off"
          {...props}
        />
        <p className="empty_error_message">
          {isRequired ? "Field Required" : ""}
        </p>
        <p className="custom_error_message">{customError ? customError : ""}</p>
      </fieldset>
    </>
  );
};

export default TextArea;
