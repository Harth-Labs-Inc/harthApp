import React, { useState, useEffect } from "react";

const Form = (props) => {
  const { children, data, on_submit, on_missing, id, errorData } = props;

  const checkMissingInputFields = () => {
    let missingFields = [];
    for (let [key, value] of Object.entries(data)) {
      if (!value.trim()) {
        missingFields.push(key);
      }
    }
    return missingFields;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
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
  };

  return (
    <form id={id} onSubmit={submitHandler}>
      {children}
    </form>
  );
};

export default Form;
