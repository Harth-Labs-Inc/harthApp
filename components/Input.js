import { useEffect } from "react";

const Input = (props) => {
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

  console.log(props);

  return (
    <>
      <fieldset className={empty ? "content" : ""}>
        <label htmlFor={name} className="form-label">
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
        />
      </fieldset>
      <p className={valid || matching == false ? "error" : ""}>
        {valid
          ? "Field Required"
          : matching == false
          ? "Passwords Do Not Match"
          : ""}
      </p>
    </>
  );
};

export default Input;
