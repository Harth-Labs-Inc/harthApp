import { useState } from 'react'
import Cookies from 'js-cookie'
import { login, addUser } from '../../../requests/userApi'
import { Button, Input } from '../../../components/Common'
import Form from '../../../components/Form-comp'

const CreateAccount = (props) => {
  const [submissionType, setSubmissionType] = useState()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
  })
  const [errorData, setErrorData] = useState({
    fullName: '',
    email: false,
    dob: false,
  })
  const [customErrors, setCustomErrors] = useState({
    email: '',
    match: '',
  })

  const { changePage, inviteToken } = props

  const submitHandler = async () => {
    if (submissionType == 'create') {
      const data = await addUser(formData)
      const { ok, errors } = data
      console.log(errors)
      if (!ok) {
        setCustomErrors(errors)
      } else {
        loginHandler()
      }
    }
  }

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData)
    setFormData(data)
  }

  const setMissing = (missing) => {
    setErrorData(missing)
  }

  const loginHandler = async () => {
    const data = await login(formData)
    const { ok, msg, tkn } = data
    if (ok) {
      Cookies.set('token', tkn, { expires: 365 })
      if (inviteToken) {
        window.location.pathname = `/comm?tkn=${inviteToken}`
      } else {
        window.location.pathname = '/comm'
      }
    } else {
    }
  }

  return (
    <div id="create-module">
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
      <h2>Create an account</h2>
      <Form
        id="login"
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
          customError={
            customErrors['email'] || customErrors['match']
              ? customErrors['email'] || customErrors['match']
              : ''
          }
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Full Name"
          name="fullName"
          type="text"
          empty={formData.fullName}
          value={formData.fullName}
          isrequired={errorData['fullName'] ? true : false}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <Input
          title="Date of Birth"
          name="dob"
          type="date"
          empty={true}
          value={formData.dob}
          isrequired={errorData['dob']}
          changeHandler={inputChangeHandler}
          data={formData}
          errorData={errorData}
        />
        <fieldset className={customErrors['match'] ? 'error' : undefined}>
          <div className="form-bottom">
            <Button
              id="account-create-submit"
              type="submit"
              text="Continue"
              onClick={() => {
                setSubmissionType('create')
              }}
            ></Button>
            <p className="disclaimer">
              By creating an account, you agree to follow H&auml;rth's{' '}
              <a>Guidelines</a>.
            </p>
            <div>
              <a
                id="return-login"
                onClick={() => {
                  changePage('login')
                }}
              >
                Already have an account?
              </a>
            </div>
          </div>
        </fieldset>
      </Form>
      <div></div>
    </div>
  )
}

export default CreateAccount
