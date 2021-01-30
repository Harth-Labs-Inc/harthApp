import { useEffect, useRef, useState } from "react";

const Input = (props) => {
  const [labelWidth, setlabelWidth] = useState(0);
  const labelEl = useRef(null);
  const {
    name,
    title,
    valid,
    placeholder,
    changeHandler,
    value,
    type,
    empty,
    data,
    errorData,
    matching,
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
          valid || matching == false ? "error" : ""
        }`}
      >
        <label htmlFor={name} className="form-label" ref={labelEl}>
          {title}
        </label>
        <div className="border-wrapper">
          <div className="input-top">
            <span className="border-1"></span>
            <span className="border-2" style={{ width: labelWidth }}></span>
            <span
              className="border-3"
              style={{ width: `calc(100% - (${labelWidth + 8}px))` }}
            ></span>
          </div>
          <div className="input-center">
            <span className="border-4"></span>
            <span className="input">
              <input
                className="form-input"
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={inputChangeHandler}
                placeholder={placeholder}
                autoComplete="off"
              />
            </span>
            <span className="border-5"></span>
          </div>
          <div className="input-bottom">
            <span className="border-6"></span>
            <span className="border-7"></span>
            <span className="border-8"></span>
          </div>
        </div>

        <p className="error-message">
          {valid
            ? "Field Required"
            : matching == false
            ? "Passwords Do Not Match"
            : ""}
        </p>
      </fieldset>
    </>
  );
};

export default Input;
