import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { login } from "../../../requests/userApi";
import Form from "../../../components/Form-comp";
import Input from "../../../components/Common/Input";
import { Button } from "../../../components/Common/Button";
import { useRouter } from "next/router";

const Login = (props) => {
  const router = useRouter();
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

  const { animationClass, changePage, inviteToken } = props;

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const submitHandler = async () => {
    setErrorMessage("");

    const data = await login(formData);
    const { ok, msg, tkn } = data;

    if (ok) {
      Cookies.set("token", tkn, { expires: 365 });
      if (inviteToken) {
        window.location.pathname = `/comm?invite=true&tkn=${inviteToken}`;
      }
      window.location.pathname = "/";
    } else {
      setErrorMessage(msg);
    }
  };

  return (
    <div className={animationClass} id="login-module">
      <img className="logo" src="../../../public/images/icon_harth.svg" />;
      <h2>Welcome to H&auml;rth</h2>
      <Form
        id="login"
        on_submit={submitHandler}
        on_missing={setMissing}
        data={formData}
        errorData={errorData}
      >
        <Input
          title="Email"
          name="email"
          type="text"
          empty={formData.email}
          value={formData.email}
          required={errorData["email"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Password"
          name="password"
          type="password"
          empty={formData.password}
          value={formData.password}
          required={errorData["password"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />

        <fieldset>
          <div className="form-bottom">
            <p className={errorMessage ? "error" : ""} id="login-error">
              {errorMessage ? errorMessage : ""}
            </p>
            <Button id="login-submit" type="submit" text="Sign In"></Button>
            <div>
              <a
                id="forgot-password-link"
                onClick={() => {
                  changePage("resetpwd");
                }}
              >
                Forgot your password?
              </a>
              <a
                id="sign-up-link"
                onClick={() => {
                  changePage("createaccount");
                }}
              >
                Need an account?
              </a>
            </div>
          </div>
        </fieldset>
      </Form>
    </div>
  );
};
export default Login;
