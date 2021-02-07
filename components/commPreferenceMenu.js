import React, { useState } from "react";
import { sendInvite } from "../requests/community";
import { validateEmail } from "../services/helper";
import { Button, CloseBtn, BackBtn } from "./Button";
import Form from "./Form-comp";
import Input from "./Input";

const CommIndexPage = (props) => {
  const [currentPage, setCurrentPage] = useState("invites");
  const [customErrors, setCustomErrors] = useState({ email: "" });
  // invite page
  const [inputData, setInputData] = useState({ email: "" });
  const [noteData, setNotetData] = useState("");
  const [errorData, setErrorData] = useState({ email: false });
  const [emailList, setEmailList] = useState(new Set());
  const [invitesSent, setInvitesSent] = useState(false);

  const { communityName, communityId, onToggleModal } = props;

  const changePageHandler = (pg) => {
    setCurrentPage(pg);
  };

  const submitHandler = async () => {
    console.log("inside");
    if (emailList.size > 0) {
      [...emailList].forEach(async (e) => {
        const data = await sendInvite(e, communityId, noteData);
        const { ok, errors } = data;
        if (ok) {
          setInvitesSent(true);
          setInputData({ email: "" });
          setNotetData("");
        }
      });
    } else {
      if (inputData.email) {
        if (!validateEmail(inputData.email)) {
          setCustomErrors({ email: "Email Is Not Valid" });
        } else {
          setCustomErrors({ email: "" });
          const data = await sendInvite(inputData.email, communityId, noteData);
          const { ok, errors } = data;
          if (ok) {
            setInvitesSent(true);
            setInputData({ email: "" });
            setNotetData("");
          }
        }
      } else {
        setCustomErrors({ email: "Field is Required" });
      }
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setInputData(data);
  };

  const InviteNoteHandler = (e) => {
    const { value } = e.target;
    setNotetData(value);
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  const handleKeyDown = (evt) => {
    if (["Enter", "Tab", ",", " "].includes(evt.key)) {
      evt.preventDefault();
      let valid = validateEmail(inputData.email);
      if (valid) {
        setEmailList(emailList.add(inputData.email));
        setInputData({ email: "" });
        setCustomErrors({ email: "" });
      } else {
        setCustomErrors({ email: "Email Is Not Valid" });
      }
    }
  };
  const handleDelete = (email) => {
    setEmailList(new Set([...emailList].filter((e) => e !== email)));
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
        <>
          {invitesSent ? (
            <h2>
              <BackBtn
                onClick={() => {
                  setInvitesSent(false);
                }}
              ></BackBtn>
              Invites sent!
            </h2>
          ) : (
            <Form
              id="invite"
              on_submit={submitHandler}
              on_missing={setMissing}
              data={inputData}
              errorData={errorData}
              ignoreMissing={true}
            >
              <fieldset>
                <p>Send an invitation to join {communityName}</p>
                <div className="email_wrapper">
                  {emailList && emailList.size > 0
                    ? [...emailList].map((email, index) => (
                        <span className="email_chip" key={index}>
                          {email}
                          <button
                            type="button"
                            className="email_delete"
                            onClick={() => {
                              handleDelete(email);
                            }}
                          ></button>
                        </span>
                      ))
                    : ""}
                </div>
                <Input
                  title="To:  "
                  name="email"
                  type="text"
                  autofocus
                  placeholder="email@example.com, another@email.com"
                  empty="true"
                  value={inputData.email}
                  changeHandler={inputChangeHandler}
                  onKeyDown={handleKeyDown}
                  customError={
                    customErrors["email"] ? customErrors["email"] : ""
                  }
                  data={inputData}
                  errorData={errorData}
                />
              </fieldset>
              <fieldset>
                <p>Include a note (optional)</p>
                <textarea
                  placeholder="add a note..."
                  rows="10"
                  onChange={InviteNoteHandler}
                ></textarea>
              </fieldset>
              <fieldset className={customErrors["match"] ? "error" : ""}>
                <div className="form-bottom">
                  <p className="error-message" id="email-exists">
                    {customErrors["custom"]}
                  </p>
                  <Button
                    id="invites-submit"
                    type="submit"
                    text="invite"
                  ></Button>
                </div>
              </fieldset>
            </Form>
          )}
        </>
      );
      break;
  }

  return (
    <>
      <div className="modal_top">
        <p>{communityName}</p>
        <CloseBtn onClick={onToggleModal}></CloseBtn>
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
