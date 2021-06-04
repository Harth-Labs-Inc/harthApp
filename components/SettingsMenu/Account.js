import { useState } from 'react'
import { useAuth } from '../../contexts/auth'
import Input from '../Common/Input'
import { Button } from '../Common/Button'

const AccountSettings = (props) => {
  const { toggleCurrentPage } = props
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('')

  const toggleCurrentSetting = (name) => {
    setCurrentTab(name)
  }

  const submitHandler = () => {
    console.log('change email')
  }

  const SettingsMenu = () => {
    return (
      <>
        <div id="account_settings_header">
          <Button id="go_back" onClick={() => toggleCurrentPage('')}>
            back
          </Button>
          <span>Your Account</span>
        </div>

        <div id="account_settings">
          <ul>
            <li>
              <h4>email</h4>
              <button
                id="account_email"
                onClick={() => toggleCurrentSetting('email')}
              >
                {user.email}
              </button>
            </li>
            <li>
              <h4>Full Name</h4>
              <button
                id="account_fullName"
                onClick={() => toggleCurrentSetting('fullName')}
              >
                {user.fullName}
              </button>
            </li>
            <li>
              <h4>Password</h4>
              <button
                id="account_password"
                onClick={() => toggleCurrentSetting('password')}
              >
                ********
              </button>
            </li>
            <li>
              <h4>Birthday</h4>
              <button id="dob" onClick={() => toggleCurrentSetting('dob')}>
                {user.dob}
              </button>
            </li>
          </ul>
        </div>
      </>
    )
  }

  const ActiveSetting = () => {
    if (currentTab !== 'password') {
      return (
        <>
          <div id="change_header">
            <button id="go_back" onClick={() => toggleCurrentSetting('')}>
              back
            </button>
            <span>Edit {currentTab}</span>
          </div>

          <form id="change_form" onSubmit={submitHandler}>
            <Input title={user[currentTab]}></Input>
            <Button text="Confirm"></Button>
          </form>
        </>
      )
    } else {
      return (
        <>
          <div id="change_header">
            <button id="go_back" onClick={() => toggleCurrentSetting('')}>
              back
            </button>
            <span>Edit {currentTab}</span>
          </div>

          <form id="change_form" onSubmit={submitHandler}>
            <Input title="Old Password"></Input>
            <Input title="New Password"></Input>
            <Button text="Change Password"></Button>
          </form>
        </>
      )
    }
  }

  if (!currentTab) {
    return <SettingsMenu />
  }
  return <ActiveSetting />
}

export default AccountSettings
