import styles from './Input.module.scss'

export const Input = (props) => {
  const {
    name,
    title,
    isrequired = false,
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
    placeholder,
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
    <fieldset
      className={`${styles.inputComponent}
                    ${empty ? 'content' : undefined} 
                    ${matching ? 'error_matching' : undefined} 
                    ${isrequired ? 'error_required' : undefined} 
                    ${customError ? 'error_custom' : undefined}`}
    >
      <label htmlFor={name}>{title}</label>
      <input
        className="form-input"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={inputChangeHandler}
        autoComplete="off"
        placeholder={placeholder}
        {...props}
      />
      <ErrorMessage />
    </fieldset>
  )
}
