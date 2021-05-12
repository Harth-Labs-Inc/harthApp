import { useEffect, useRef, useState } from "react";

const Input = (props) => {
  const [labelWidth, setlabelWidth] = useState(0);
  const labelEl = useRef(null);
  const {
    name,
    title,
    required,
    placeholder,
    changeHandler,
    value,
    type,
    empty,
    data,
    errorData,
    matching,
    customError,
  } = props;

  useEffect(() => {
    if (title) {
      setlabelWidth(labelEl.current.clientWidth);
    } else {
      setlabelWidth(0);
    }
  }, [labelEl.current]);

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
        className={`${empty ? "content" : ""} ${
          matching ? "error_matching" : ""
        } ${required ? "error_required" : ""} ${
          customError ? "error_custom" : ""
        }`}
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
        <p className="empty_error_message">
          {required ? "Field Required" : ""}
        </p>
        <p className="custom_error_message">{customError ? customError : ""}</p>
      </fieldset>
    </>
  );
};

export default Input;
