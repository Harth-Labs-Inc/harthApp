import { useRef, useState, useEffect } from "react";
import { useComms } from "../../../contexts/comms";
import { sendInviteEmails } from "../../../requests/community";
import styles from "./inviteModal.module.scss";
import { IconInviteEmail } from "resources/icons/IconInviteEmail";
import { IconClose } from "resources/icons/IconClose";
const InviteComp = (props) => {
  const { comms, setCommsFromChild, selectedCommRef, profile } = useComms();
  const [COMMS, SETCOMMS] = useState([]);
  const [selectedHarth, setSelectedHarth] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [enteredEmails, setEnteredEmails] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [formatError, setFormatError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const { toggleCurrentPage } = props;

  const commsRef = useRef([]);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (comms) {
      commsRef.current = comms;
      SETCOMMS(comms);
    }
  }, [comms]);
  useEffect(() => {
    if (selectedCommRef.current) {
      setSelectedHarth(selectedCommRef.current);
    }
  }, [selectedCommRef.current]);
  useEffect(() => {
    return () => {
      setCommsFromChild(commsRef.current);
    };
  }, []);

  const adjustInputWidth = () => {
    const input = emailInputRef.current;
    if (input) {
        input.style.width = ((input.value.length + 1) * 8) + 'px';
    }
  };

  useEffect(() => {
    adjustInputWidth();
  }, [emailInput]);

  const handleBack = () => {
    toggleCurrentPage("");
  };
  const handleHarthChange = (harth) => {
    setSelectedHarth(harth);
    toggleDropdown(false);
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleInputChange = (e) => {
    setEmailInput(e.target.value);
    setSubmitError(null);
    setFormatError(null);
    adjustInputWidth();
  };
  const handleInputKeyPress = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();

      const newEmail = emailInput.trim();
      if (newEmail && emailRegex.test(newEmail)) {
        if (!enteredEmails.includes(newEmail)) {
          setEnteredEmails([...enteredEmails, newEmail]);
        }

        setEmailInput("");
        setFormatError(null);
      } else if (newEmail && !emailRegex.test(newEmail)) {
        setFormatError(true);
      }
    }
  };
  const handleEmailDelete = (emailToDelete) => {
    const updatedEmails = enteredEmails.filter(
      (email) => email !== emailToDelete
    );
    setEnteredEmails(updatedEmails);
  };
  const submitHandler = async () => {
    let emails = enteredEmails;

    const newEmail = emailInput.trim();
    if (newEmail && emailRegex.test(newEmail)) {
      if (!emails.includes(newEmail)) {
        emails = [...emails, newEmail];
      }
    }

    if (!emails.length) {
      setSubmitError("Please enter an email");
      return;
    }

    if (!isSubmitting) {
      setIsSubmitting(true);
      await sendInviteEmails({ selectedHarth, enteredEmails: emails, profile });
      setEnteredEmails(emails);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }
  };
  const resetHandler = () => {
    setEmailInput("");
    setEnteredEmails([]);
    setSubmitError(null);
    setFormatError(null);
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSelectedHarth(selectedCommRef.current);
  };
  if (!comms) {
    return <p>...loading</p>;
  }

  if (!comms.length) {
    return <p>No harths found</p>;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.innerContainer}>
        <div className={styles.content}>
          {!submitSuccess ? (
            <>
              <div className={styles.heading}>
                <div className={styles.imageHeader}>
                  <IconInviteEmail />
                </div>
                <p>
                  Send
                  <br />
                  an Invite
                </p>
              </div>

              {/* <button className={styles.closeBtn} onClick={handleBack}>
                <IconClose />
              </button> */}

              <div className={styles.InviteList}>
                <div className={styles.harthdropdown}>
                  <label className={styles.labelText} htmlFor="harthSelect">
                    Select a group
                  </label>
                  <div
                    className={styles.dropdownheader}
                    onClick={toggleDropdown}
                  >
                    <div className={styles.dropdownSelected}>
                      {selectedHarth?.iconKey && (
                        <img
                          style={{ height: "40px", width: "40px" }}
                          src={selectedHarth.iconKey}
                          alt={selectedHarth.name}
                          className="harth-iconKey"
                        />
                      )}
                      <span>{selectedHarth?.name}</span>
                    </div>

                    <span className={styles.arrow}>&#9660;</span>
                  </div>
                  {isDropdownOpen && (
                    <div className={styles.dropdownoptions}>
                      {COMMS.map((harth) => (
                        <div
                          className={styles.dropdownoption}
                          key={harth._id}
                          onClick={() => handleHarthChange(harth)}
                        >
                          {harth.iconKey && (
                            <img
                              style={{ height: "40px", width: "40px" }}
                              src={harth.iconKey}
                              alt={harth.name}
                              className="harth-iconKey"
                            />
                          )}
                          <span>{harth.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className={styles.labelText} htmlFor="harthSelect">
                  Recipient Email
                </label>
                
                <div className={styles.emailinput}>
                  <div className={styles.enteredemails}>
                    <div className={styles.innerenteredemails}>
                      {enteredEmails.map((email, index) => (
                        <div className={styles.email} key={index}>
                          <button onClick={() => handleEmailDelete(email)}>
                            <IconClose />
                          </button>
                          {/* {index !== enteredEmails.length - 1 ? (
                            <span>,</span>
                          ) : null} */}
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                  <input
                    ref={emailInputRef}
                    type="text"
                    autocapitalize="none"
                    placeholder="email@email.com"
                    value={emailInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyPress}
                  />
                </div>
              </div>

              <p className={styles.error}>
                {submitError ? "Please add an email" : ""}
                {formatError ? "Invalid format" : ""}
              </p>

              <div className={styles.actionBar}>
                <button className={styles.cancel} onClick={handleBack}>
                  Cancel
                </button>
                <button className={styles.submit} onClick={submitHandler}>
                  {!isSubmitting ? (
                    "Send Invite"
                  ) : (
                    <span className={styles.loader} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={` ${styles.heading} ${styles.headingCenter} `}>
                Invite Sent!
              </div>
              {/* <button className={styles.closeBtn} onClick={handleBack}>
                X
              </button> */}
              <div className={styles.success}>
                <br />
                <p>Your invite has been sent to:</p>
                <p>{enteredEmails.join(", ")}</p>
                <br />
                <p className={styles.sub}>
                  Invites may take up to 15m to be delivered. This invite
                  expires in 48 hours.
                </p>
              </div>

              <div className={styles.actionBar}>
                <button className={styles.cancel} onClick={handleBack}>
                  Done
                </button>
                <button className={styles.submit} onClick={resetHandler}>
                  <p>Send Another Invite</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteComp;
