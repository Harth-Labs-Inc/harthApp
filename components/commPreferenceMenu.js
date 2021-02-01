import React, { useState } from "react";
import { useAuth } from "../contexts/auth";
import { sendInvite } from "../requests/community";
import { Button, CloseBtn } from "./Button";
import Form from "./Form-comp";
import Input from "./Input";

const CommIndexPage = (props) => {
  const [currentPage, setCurrentPage] = useState("invites");
  const [formData, setFormData] = useState({ email: "" });
  const [errorData, setErrorData] = useState({ email: false });
  const [customErrors, setCustomErrors] = useState({ email: "" });

  const { user } = useAuth();
  const { communityName, communityId } = props;

  const changePageHandler = (pg) => {
    console.log(pg);
    setCurrentPage(pg);
  };

  const submitHandler = async () => {
    console.log(formData);
    const data = await sendInvite(formData.email, communityId);
    const { ok, errors } = data;
    console.log(data);
    if (!ok) {
      setCustomErrors(errors);
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  let page;
  switch (currentPage) {
    case "profile":
      page = <p>profile</p>;
      break;
    case "premium":
      page = <p>premium</p>;
      break;
    case "admin":
      page = <p>admin</p>;
      break;
    default:
      page = (
        <Form
          id="login"
          on_submit={submitHandler}
          on_missing={setMissing}
          data={formData}
          errorData={errorData}
        >
          <fieldset>
            <p>Send an invitation to join {communityName}</p>
            <Input
              title="To:  "
              name="email"
              type="email"
              autofocus
              placeholder="email@example.com, another@email.com"
              empty={true}
              value={formData.email}
              required={errorData["email"]}
              changeHandler={inputChangeHandler}
              customError={customErrors["email"] ? "Not A Valid Email" : ""}
              data={formData}
              errorData={errorData}
            />
          </fieldset>
          <fieldset>
            <p>Include a note (optional)</p>
          </fieldset>
          <fieldset className={customErrors["match"] ? "error" : ""}>
            <div className="form-bottom">
              <p className="error-message" id="email-exists">
                {customErrors["custom"]}
              </p>
              <Button id="invites-submit" type="submit" text="invite"></Button>
            </div>
          </fieldset>
        </Form>
      );
      break;
  }

  return (
    <>
      <div className="modal_top">
        <p>{communityName}</p>
        <CloseBtn></CloseBtn>
      </div>
      <aside className="modal_left">
        <ul id="nav_comm_preferences" role="nav">
          <li
            className={currentPage == "profile" ? "active" : ""}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler("profile");
              }}
            >
              My Profile
            </button>
          </li>
          <li
            className={currentPage == "premium" ? "active" : ""}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler("premium");
              }}
            >
              Premium
            </button>
          </li>
          <li
            className={currentPage == "invites" ? "active" : ""}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler("invites");
              }}
            >
              Invites
            </button>
          </li>
          <li
            className={currentPage == "admin" ? "active" : ""}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler("admin");
              }}
            >
              Admin
            </button>
          </li>
        </ul>
      </aside>
      <div className="modal_right">{page}</div>
    </>
  );
};

export default CommIndexPage;
