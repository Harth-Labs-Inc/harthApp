import { Button } from '../../../components/Common'

const SubmitCom = (props) => {
  const { onCreate } = props

  return (
    <>
      <h2>Success!!</h2>
      <p>
        Welcome to your new h&auml;rth. <br />
        We hope you have a great time
      </p>

      <div className="form-bottom">
        <Button
          id="comm-name-submit"
          onClick={() => {
            onCreate()
          }}
          text="LET'S GO"
        ></Button>
      </div>
    </>
  )
}

export default SubmitCom
