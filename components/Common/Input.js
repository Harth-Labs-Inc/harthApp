const Input = (props) => {
  const {
    name,
    title,
    isrequired,
    changeHandler,
    value,
    type,
    empty,
    data,
    errorData,
    matching,
    customError,
    changePage,
    currentPage,
  } = props

  const inputChangeHandler = (e) => {
    const { name, value } = e.target
    let tempErrorData = {
      ...errorData,
      [name]: false,
    }
    let tempData = {
      ...data,
      [name]: value,
    }
    changeHandler(tempErrorData, tempData)
  }

  const ErrorMessage = () => {
    if (customError) {
      return (
        <p className="custom_error_message">{customError ? customError : ''}</p>
      )
    } else if (type === 'password' && currentPage && currentPage == 'login') {
      return (
        <p className="password_error_message">
          <a
            onClick={() => {
              changePage('resetpwd')
            }}
          >
            Forgot your password?
          </a>
        </p>
      )
    } else {
      return (
        <p className="empty_error_message">
          {isrequired ? 'Field Required' : undefined}
        </p>
      )
    }
  }

  return (
    <>
      <fieldset
        className={`${empty ? 'content' : undefined} 
                    ${matching ? 'error_matching' : undefined} 
                    ${isrequired ? 'error_required' : undefined} 
                    ${customError ? 'error_custom' : undefined}`}
      >
        <input
          className="form-input"
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={inputChangeHandler}
          placeholder={title}
          autoComplete="off"
          {...props}
        />
        <ErrorMessage />
      </fieldset>
    </>
  )
}

export default Input
