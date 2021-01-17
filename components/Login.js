import React, { useState } from "react";
import Button from "./Button";
import Cookies from "js-cookie";

import { login } from "../requests/userApi";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const emailChangeHandler = (e) => {
    const { value } = e.target;
    setEmail(value);
  };
  const passwordChangeHandler = (e) => {
    const { value } = e.target;
    setPassword(value);
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(email, password);
    const data = await login({ email, password });
    if (data.tkn) {
      Cookies.set("token", data.tkn, { expires: 365 });
      window.location.pathname = "/";
    }
    console.log(data);
  };
  return (
    <div className={props.animationClass} id="login-module">
      <h2>Project Blarg</h2>
      <form id="login" onSubmit={submitHandler}>
        <fieldset className={email ? "content" : ""}>
          <label htmlFor="email">Login</label>
          <input
            name="email"
            type="email"
            required
            onChange={emailChangeHandler}
          />
        </fieldset>
        <fieldset className={password ? "content" : ""}>
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            required
            onChange={passwordChangeHandler}
          />
        </fieldset>
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
              <p id="login-error">{errorMessage ? errorMessage : ""}</p>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};
export default Login;
