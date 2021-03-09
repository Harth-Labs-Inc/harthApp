import React, { useState, useEffect } from "react";

const Form = (props) => {
  const {
    children,
    data,
    on_submit,
    on_missing,
    id,
    errorData,
    ignoreMissing,
  } = props;

  const checkMissingInputFields = () => {
    let missingFields = [];
    for (let [key, value] of Object.entries(data)) {
      if (typeof value == "string" && !value.trim()) {
        missingFields.push(key);
      }
    }
    // return missingFields;
    return [];
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (ignoreMissing) {
      on_submit();
    } else {
      let missing = checkMissingInputFields();
      if (missing.length > 0) {
        let tempErrorData = { ...errorData };
        missing.forEach((mInput) => {
          tempErrorData[mInput] = true;
        });
        on_missing(tempErrorData);
      } else {
        on_submit();
      }
    }
  };

  return (
    <form id={id} onSubmit={submitHandler}>
      {children}
    </form>
  );
};

export default Form;
