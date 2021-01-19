import React, { useState, useEffect } from "react";
import Button from "./Button";

import { Router } from "next/router";
import { addUser } from "../requests/userApi";

const CreateAccount = (props) => {
  const [transitionClass, setTransitionClass] = useState();
  const [accountCreationStatus, setAccountCreationStatus] = useState(false);
  const [matchingPwdStatus, setMatchingPwdStatus] = useState(true);
  const [existsError, setExistsError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    conf_password: "",
    access_code: "",
  });
  const [errorData, setErrorData] = useState({
    email: false,
    password: false,
    conf_password: false,
    access_code: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("right-center");
    }, 4);
  }, []);

  const checkMissingInputFields = () => {
    let missingFields = [];
    for (let [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        missingFields.push(key);
      }
    }
    return missingFields;
  };

  const checkMatchingPwFields = () => {
    let valid;
    if (formData.password.trim() === formData.conf_password.trim()) {
      valid = true;
    } else {
      valid = false;
    }
    return valid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    let tempErrorData = { ...errorData };
    let missing = checkMissingInputFields();
    let matching = checkMatchingPwFields();
    setMatchingPwdStatus(matching);
    if (missing.length > 0) {
      missing.forEach((mInput) => {
        tempErrorData[mInput] = true;
      });
      setErrorData(tempErrorData);
    } else {
      if (matching) {
        const data = await addUser(formData);
        const { exists } = data;
        if (exists) {
          setExistsError(true);
        } else {
          setAccountCreationStatus(true);
        }
      }
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

  return (
    <div
      className={`${transitionClass} ${
        accountCreationStatus ? "account-created" : ""
      }`}
      id="create-module"
    >
      {accountCreationStatus ? (
        <h2>Account Creation Successful</h2>
      ) : (
        <h2>Create an Account</h2>
      )}

      <form id="login" onSubmit={submitHandler}>
        <fieldset className={formData.email ? "content" : ""}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            onChange={handleInputChange}
            autoComplete="off"
          />
        </fieldset>
        <p className={errorData["email"] ? "error" : ""}>Field Required</p>

        <fieldset className={formData.password ? "content" : ""}>
          <label>Password</label>
          <input name="password" type="password" onChange={handleInputChange} />
        </fieldset>
        <p className={errorData["password"] ? "error" : ""}>Field Required</p>

        <fieldset className={formData.conf_password ? "content" : ""}>
          <label>Confirm Password</label>
          <input
            name="conf_password"
            type="password"
            onChange={handleInputChange}
          />
        </fieldset>
        <p
          className={
            errorData["conf_password"] || !matchingPwdStatus ? "error" : ""
          }
        >
          {errorData["conf_password"]
            ? "Field Required"
            : !matchingPwdStatus
            ? "Passwords Do Not Match"
            : ""}
        </p>

        <fieldset className={formData.access_code ? "content" : ""}>
          <label>Access Code</label>
          <input
            name="access_code"
            type="text"
            onChange={handleInputChange}
            autoComplete="off"
          />
        </fieldset>
        <p className={errorData["access_code"] ? "error" : ""}>
          Field Required
        </p>
        <fieldset>
          <div className="form-bottom">
            <div>
              <a
                id="return-login"
                onClick={() => {
                  setTransitionClass("");
                  props.changePage("login");
                }}
              >
                Already have an account?
              </a>
            </div>
            {accountCreationStatus ? (
              <Button
                id="account-create-submit"
                text="Go to dashboard"
                onClick={() => {
                  console.log("clicked");
                  window.location.pathname = "/dashboard";
                  Router.push("/dashboard");
                }}
              ></Button>
            ) : (
              <Button
                id="account-create-submit"
                type="submit"
                text="Create Account"
              ></Button>
            )}
            <p className={existsError ? "error" : ""}>Email Already Exists</p>
          </div>
        </fieldset>
      </form>
      <div></div>
    </div>
  );
};

export default CreateAccount;
