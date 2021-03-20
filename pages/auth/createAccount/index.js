import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { login, addUser } from "../../../requests/userApi";
import Input from "../../../components/Common/Input";
import Form from "../../../components/Form-comp";
import { Button } from "../../../components/Common/Button";

const CreateAccount = (props) => {
  const [transitionClass, setTransitionClass] = useState();
  const [submissionType, setSubmissionType] = useState();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
  });
  const [errorData, setErrorData] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    dob: false,
  });
  const [customErrors, setCustomErrors] = useState({
    email: "",
    password: "",
    match: "",
  });

  const { changePage, inviteToken } = props;

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("right-center");
    }, 4);
  }, []);

  const submitHandler = async () => {
    if (submissionType == "create") {
      const data = await addUser(formData);
      const { ok, errors } = data;
      console.log(data);
      if (!ok) {
        setCustomErrors(errors);
      } else {
        loginHandler();
      }
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const loginHandler = async () => {
    const data = await login(formData);
    const { ok, msg, tkn } = data;
    if (ok) {
      Cookies.set("token", tkn, { expires: 365 });
      if (inviteToken) {
        window.location.pathname = `/comm?tkn=${inviteToken}`;
      } else {
        window.location.pathname = "/comm";
      }
    } else {
    }
  };

  return (
    <div className={transitionClass} id="create-module">
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
          customError={customErrors["email"] ? "Not A Valid Email" : ""}
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
          customError={
            customErrors["password"] ? "Must Be Over 8 Characters" : ""
          }
          data={formData}
          errorData={errorData}
        />
        <Input
          title="First Name"
          name="firstName"
          type="text"
          empty={formData.firstName}
          value={formData.firstName}
          required={errorData["firstName"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Last Name"
          name="lastName"
          type="text"
          empty={formData.lastName}
          value={formData.lastName}
          required={errorData["lastName"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Date of Birth"
          name="dob"
          type="date"
          empty={true}
          value={formData.dob}
          required={errorData["dob"]}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <fieldset className={customErrors["match"] ? "error" : ""}>
          <div className="form-bottom">
            <p className="error-message" id="email-exists">
              {customErrors["match"]}
            </p>

            <Button
              id="account-create-submit"
              type="submit"
              text="Continue"
              onClick={() => {
                setSubmissionType("create");
              }}
            ></Button>

            <div>
              <a
                id="return-login"
                onClick={() => {
                  setTransitionClass("");
                  changePage("login");
                }}
              >
                Already have an account?
              </a>
            </div>
          </div>
        </fieldset>
      </Form>
      <div></div>
    </div>
  );
};

export default CreateAccount;
