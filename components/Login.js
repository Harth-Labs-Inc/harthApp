import React, { useState } from "react";
import Button from "./Button";
import Cookies from "js-cookie";

import { login } from "../requests/userApi";

const Login = (props) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorData, setErrorData] = useState({
    email: false,
    password: false,
    conf_password: false,
    access_code: false,
  });

  const checkMissingInputFields = () => {
    let missingFields = [];
    for (let [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        missingFields.push(key);
      }
    }
    return missingFields;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    let tempErrorData = { ...errorData };
    let missing = checkMissingInputFields();
    if (missing.length > 0) {
      missing.forEach((mInput) => {
        tempErrorData[mInput] = true;
      });
      setErrorData(tempErrorData);
    } else {
      const data = await login(formData);
      const { ok, msg, tkn } = data;

      if (ok) {
        Cookies.set("token", tkn, { expires: 365 });
        window.location.pathname = "/";
      } else {
        setErrorMessage(msg);
      }
      console.log(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrorData({
      ...errorData,
      [name]: false,
    });
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // const submitHandler = async (e) => {
  //   e.preventDefault();

  //
  // };
  return (
    <div className={props.animationClass} id="login-module">
      <h2>Project Blarg</h2>
      <form id="login" onSubmit={submitHandler}>
        <fieldset className={formData.email ? "content" : ""}>
          <label htmlFor="email">Login</label>
          <input
            name="email"
            type="email"
            onChange={handleInputChange}
            autoComplete="off"
          />
        </fieldset>
        <p className={errorData["email"] ? "error" : ""}>Field Required</p>
        <fieldset className={formData.password ? "content" : ""}>
          <label htmlFor="password">Password</label>
          <input name="password" type="password" onChange={handleInputChange} />
        </fieldset>
        <p className={errorData["password"] ? "error" : ""}>Field Required</p>
        <fieldset>
          <div className="form-bottom">
            <div>
              <a
                id="forgot-password-link"
                onClick={() => {
                  props.changePage("resetpwd");
                }}
              >
                Trouble logging in?
              </a>
              <a
                id="sign-up-link"
                onClick={() => {
                  props.changePage("createaccount");
                }}
              >
                Need an account?
              </a>
            </div>
            <div>
              <Button id="login-submit" type="submit" text="Sign In"></Button>
              <p className={errorMessage ? "error" : ""} id="login-error">
                {errorMessage ? errorMessage : ""}
              </p>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};
export default Login;
