import React, { useState, useEffect } from "react";

const Form = ({ props, children }) => {
  const [formData, setFormData] = useState({});
  const [errorData, setErrorData] = useState({});

  useEffect(() => {
    console.log(props);
  }, [props]);

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
    let tempErrorData = { ...errorData };
    let missing = checkMissingInputFields();
    if (missing.length > 0) {
      missing.forEach((mInput) => {
        tempErrorData[mInput] = true;
      });
      setErrorData(tempErrorData);
    } else {
      props.on_submit();
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
    <form {...props} onSubmit={submitHandler}>
      {children}
    </form>
  );
};

export default Form;
