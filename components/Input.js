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
    setlabelWidth(labelEl.current.clientWidth);
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
          <div id="input-top">
            <span id="border-1"></span>
            <span id="border-2" style={{ width: labelWidth }}></span>
            <span
              id="border-3"
              style={{ width: `calc(100% - (${labelWidth + 8}px))` }}
            ></span>
          </div>
          <div id="input-center">
            <span id="border-4"></span>
            <span id="input">
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
            <span id="border-5"></span>
          </div>
          <div id="input-bottom">
            <span id="border-6"></span>
            <span id="border-7"></span>
            <span id="border-8"></span>
          </div>
        </div>

        <p>
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
