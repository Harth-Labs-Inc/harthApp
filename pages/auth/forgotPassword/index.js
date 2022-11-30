import React, { useState } from 'react'
import { reset } from '../../../requests/userApi'
import { Button, Input } from '../../../components/Common'
import Form from '../../../components/Form-comp'

const ResetPwd = (props) => {
  const [errorMessage, setErrorMessage] = useState()
  const [emailSent, setEmailSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
  })
  const [errorData, setErrorData] = useState({
    email: false,
  })

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData)
    setFormData(data)
  }

  const setMissing = (missing) => {
    setErrorData(missing)
  }

  const submitHandler = async () => {
    const data = await reset(formData.email)
    const { ok, msg } = data

    if (ok) {
      setEmailSent(true)
    } else {
      setErrorMessage(msg)
    }
  }

  return (
    <>
      {emailSent ? (
        <aside id="email-sent">
          <div>
            <h2>Password Reset</h2>
            <p>
              Password reset instrtuctions have been sent to {formData.email}.
              If you do not see the email in you inbox please check your spam
              folder.
            </p>
            <Button
              onClick={() => {
                setEmailSent(false)
                props.changePage('login')
              }}
              text="Okay"
            ></Button>
          </div>
        </aside>
      ) : (
        ''
      )}
      <div id="forgot-password">
        <svg
          id="logo_large"
          data-name="Logo Large"
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="99.001"
          viewBox="0 0 96 99.001"
        >
          <path
            id="Path_2099"
            data-name="Path 2099"
            d="M90,99V48A42,42,0,0,0,6,48V99H0V48a48,48,0,0,1,96,0V99ZM30.91,55a42.38,42.38,0,0,1,5.25-9.155c2.5-3.566,4.86-6.915,5.881-13.05a.747.747,0,0,1,.863-.612.709.709,0,0,1,.241.083c.909.436,14.975,7.379,17.957,22.279a8.072,8.072,0,0,0,.635-1.3,15.036,15.036,0,0,0,.914-4.174.745.745,0,0,1,.8-.691.732.732,0,0,1,.566.339c1.016,1.414,3.441,7.082,2.286,13.6A20.641,20.641,0,0,1,59.59,74.115a.73.73,0,0,1-.506.195l-9.192,0a.75.75,0,0,1-.751-.747.777.777,0,0,1,.107-.39c.872-1.688,1.563-5.477,1.442-9.294a18.845,18.845,0,0,0-.914-5.5A34.3,34.3,0,0,1,47.5,66.528a19.978,19.978,0,0,1-5.25,7.615.737.737,0,0,1-.478.172H36.063a.727.727,0,0,1-.478-.172A15.077,15.077,0,0,1,29.8,65.688,17.318,17.318,0,0,1,30.91,55ZM25.693,86.344a3,3,0,1,1,0-6H70.307a3,3,0,1,1,0,6Z"
            fill="#333"
          />
        </svg>
        <h2>Reset your password</h2>
        <Form
          id="reset-password"
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
            isrequired={errorData['email']}
            changeHandler={inputChangeHandler}
            data={formData}
            errorData={errorData}
          />
          <fieldset className={errorMessage ? 'error' : undefined}>
            <div className="form-bottom">
              <p id="email-error">{errorMessage ? errorMessage : ''}</p>
              <Button
                id="password-reset-submit"
                type="submit"
                text="Next"
              ></Button>
              <div>
                <a
                  id="return-login"
                  onClick={() => {
                    props.changePage('login')
                  }}
                >
                  Sign In
                </a>
              </div>
            </div>
          </fieldset>
        </Form>
      </div>
    </>
  )
}
export default ResetPwd
