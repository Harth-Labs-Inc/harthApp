import AWS from "aws-sdk";
AWS.config = {
    accessKeyId: "AKIARIGZHATFWEQ2TU4K",
    secretAccessKey: "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",
    region: "us-east-1",
};

/* eslint-disable */

export default async (req, res) => {
    let obj;
    try {
        obj = JSON.parse(req.body);
    } catch (e) {
        obj = req.body;
    }

    const { user, subject } = obj;
    const { otp, email } = user;
    const sendEmail = (otp, email, subject) => {
        return new Promise((resolve, reject) => {
            let nodemailer = require("nodemailer");

            let logo = `data:image/png;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjM2IiB2aWV3Qm94PSIwIDAgMTIwIDM2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzI5MDJfNDQ0NzQpIj4NCjxwYXRoIGQ9Ik00OS44OTI1IDEyLjA2ODNDNDUuNDkwMiAxMi4wNjgzIDQyLjIyNDEgMTIuOTQ3NyA0MC4yMzU3IDE0LjI3NjdDMzguNzcyIDE1LjI1NTYgNDAuMzI1NCAyMC4wMzEzIDQyLjk0NjUgMTguOTE1OUM0NC41NTU4IDE4LjIzMDggNDYuNDQwMyAxNy4yOTk4IDQ5LjIwNyAxNy4yOTk4QzUyLjUzIDE3LjI5OTggNTQuNDY3MiAxOC4yMjkyIDU1LjEwNDIgMjEuMjcwN0M0OC42OTg3IDIwLjE0NTQgMzguMzY5MSAxOS42NjgyIDM4LjM2OTEgMjguMjk1NEMzOC4zNjkxIDMzLjAyNjggNDIuMDQxNyAzNC44OTY2IDQ2LjkyMzggMzQuODk2NkM0Ny4wMzkzIDM0Ljg5NjYgNDcuMTU1MyAzNC44OTE5IDQ3LjI3MjQgMzQuODkxOUM1MC41ODY5IDM0Ljg5MTkgNTMuMzM3MiAzNC4yNDkgNTUuNDM2OSAzMi42NzFDNTUuNjMwNCAzNC45NDMgNTkuMTAyNiAzNC42MjM2IDU5LjEwMjYgMzQuNjIzNkM2MC43NjIgMzQuNjIzNiA2MS4wMTU2IDMzLjc1NzcgNjEuMDE1NiAzMi45MjA2VjIzLjkxNDFDNjEuMDE1MSAxNi4zODYxIDU4LjMyNzUgMTIuMDY4MyA0OS44OTI1IDEyLjA2ODNaTTQ5LjY4ODkgMjkuOTU3OEM0Ni40OTU3IDMwLjI1NjMgNDQuNjE4NSAyOS4wMDQ0IDQ1LjM2OTQgMjcuMzMyMUM0Ni45MjU0IDIzLjg2NjEgNTUuMzQxNSAyNS43MTUgNTUuMzQxNSAyNS43MTVDNTUuMzQxNSAyNy40Mzc0IDUzLjcyNDMgMjkuNTgwMSA0OS42ODg5IDI5Ljk1NzhaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTc3LjcwMTUgMTIuMjQ2NEM3My4zNzA5IDExLjgxMTQgNzEuMjA2OSAxMy43MTcxIDY5Ljc5NDMgMTYuNTcwNUM2OS40MzMxIDExLjcyNzUgNjUuMTI2NyAxMi40OTQ5IDY1LjEyNjcgMTIuNDk0OUM2NC4yNzg5IDEyLjQ5NDkgNjMuNTkxOCAxMy4xNzM4IDYzLjU5MTggMTQuMDExVjE0Ljg5ODJWMTQuODk5MlYzMS4yOTJDNjMuNTkxOCAzMy4xNTgxIDYzLjU5MTggMzQuNjcxNSA2Ny4wMTI4IDM0LjY3MTVINjcuNjIzNEM2OS41MTIyIDM0LjY3MTUgNzAuNjUxMSAzMy42MTE5IDcwLjYxNzQgMzEuODcwM0w3MC41NTk0IDI4Ljg1ODZMNzAuNDk4MiAyMy45Mjc2QzcwLjQ5ODIgMTkuNDE1IDczLjMyNzEgMTguMzc0MSA3Ni45MDc0IDE4LjU2NDJDNzguMDYyNyAxOC42MjU3IDc4LjkxODQgMTguMjA2OCA3OC45NzQzIDE3LjA1MzRMNzkuMTYzNiAxMy43NjRDNzkuMTcyMSAxMi43ODMgNzguNTE3MiAxMi4zMjgyIDc3LjcwMTUgMTIuMjQ2NFoiIGZpbGw9IndoaXRlIi8+DQo8cGF0aCBkPSJNMzIuNjY4NSA0LjQ5NDQySDMyLjMwMTVDMjguODQ3MyA0LjQ5NDQyIDI4LjY3MjIgNS45NzUwMSAyOC42NzIyIDcuMDA5MTNWNy44NzcwNlY4LjEzNjUxSDI4LjY3MDFWMTEuMzM1M1YxMi44NDU1SDguMTk3NjVDOC4xOTc2NSAxMi44NDU1IDguMjEzOTkgMTIuNTYwMSA4LjE5NzY1IDExLjM3ODVWNy4wMDkxM0M4LjE5NzY1IDUuOTc1NTMgOC4xNzkxOSA0LjQ5NDQyIDQuNzg1NTcgNC40OTQ0MkgzLjk4NDFDMC42MTI2MjMgNC40OTQ0MiAwLjU3MjAyMSA1Ljk3NTAxIDAuNTcyMDIxIDcuMDA5MTNWMzIuMTgzOUMwLjU3MjAyMSAzMy4yMTc1IDAuODk0NzIxIDM0LjQ4NCAzLjk4NDEgMzQuNDg0SDQuNzg1MDVDOC4wMzk0NiAzNC40ODQgOC4xOTcxMiAzMy4yMTcgOC4xOTcxMiAzMi4xODM5VjIwLjQyOTNWMTguOTE1M0gyOC42Njk2VjIwLjQyMlYyNy4zNTgySDI4LjY3MTdWMzIuMTgzOUMyOC42NzE3IDMzLjIxNzUgMjguNzkzIDM0LjQ4NCAzMi4wODM4IDM0LjQ4NEgzMi44ODQ3QzM2LjEwNDggMzQuNDg0IDM2LjI5NzMgMzMuMjE3IDM2LjI5NzMgMzIuMTgzOVYxMS43ODQzVjcuMDA4NjFDMzYuMjk3OCA1Ljk3NTAxIDM2LjEyNTkgNC40OTQ0MiAzMi42Njg1IDQuNDk0NDJaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTkxLjU1IDEyLjU1NTlIODcuMjg4VjkuMjEzMzVDODcuMjg4IDguMjg4NjMgODcuMTUxNCA3LjExMDIgODQuNzI1NCA3LjExMDJIODMuNzk5NEM4MS4zNzYgNy4xMTAyIDgxLjA0OTYgOC4yMDg5MiA4MS4wMjQzIDkuMzE5NjNMODAuNDY1NCAyOC44MDdDODAuMzc1MiAzMi4wMTcyIDgyLjk4NDggMzQuNjY3OSA4Ni4yMzU1IDM0LjY2NzlIOTAuNjgwNUM5Mi4zOTM3IDM0LjY2NzkgOTMuNDYyIDMzLjg2ODcgOTMuNDYyIDMxLjkyMjlWMzEuMTcxNkM5My40NjIgMjkuODk2MyA5Mi43NTM4IDI4LjkwMzkgOTAuMjU3NyAyOC45MDM5TDg5LjAxMDEgMjguODYyN0M4Ny40MjI0IDI4Ljc5OTIgODcuMDczOSAyNy43Mzc5IDg3LjA5OTcgMjYuNjAxMkw4Ny4yODg1IDE4LjA5NjlIOTEuNTUwNkM5Mi40ODY1IDE4LjA5NjkgOTMuNDYyIDE3Ljg3NiA5My40NjIgMTUuNzc5MVYxNC44NzM3QzkzLjQ2MTQgMTMuMTQyIDkyLjk0NzkgMTIuNTU1OSA5MS41NSAxMi41NTU5WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMDkuNTQxIDExLjk3MjlDMTA3Ljc0NyAxMS45NzI5IDEwNC43MTMgMTIuNTgyNCAxMDIuNTU3IDE0Ljg0OTdWNi45MDg1OEMxMDIuNTU3IDUuODExOTQgMTAyLjQ2MSA0LjQ5NDQyIDk5LjQ2MzYgNC40OTQ0Mkg5OC43MzU5Qzk1Ljc5ODQgNC40OTQ0MiA5NS42NDIzIDUuODExOTQgOTUuNjQyMyA2LjkwODU4VjMyLjI1NzNDOTUuNjQyMyAzMy4zNTQgOTUuODk3IDM0LjY3MTUgOTguNzM1OSAzNC42NzE1SDk5LjQ2MzZDMTAyLjI0OSAzNC42NzE1IDEwMi41NTcgMzMuMzU0IDEwMi41NTcgMzIuMjU3M1YyMy42Mjg1QzEwMi41NiAxOC4yNTU4IDEwNi42MTUgMTcuNTg5IDEwNy44NCAxNy41Nzg1QzExMS4yNjYgMTcuNTQ5NCAxMTIuNjg0IDE4LjQ1NjQgMTEyLjY4NCAyNi41Njg0VjMyLjM3NjFDMTEyLjY4NCAzMy40MDcxIDExMi44NzQgMzQuNjcxNSAxMTUuNjU4IDM0LjY3MTVIMTE2LjM1N0MxMTkuMTEgMzQuNjcxNSAxMTkuMzE2IDMzLjQyNDMgMTE5LjMzMiAzMi40MDM3TDExOS40OTMgMjMuNTY2NUMxMTkuNDkzIDEzLjU4MTEgMTEzLjk5IDExLjk3MjkgMTA5LjU0MSAxMS45NzI5WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik00OC45MDE3IDUuMTYzODhDNDguOTAxNyA3LjM4MTY0IDQ3LjA4MTUgOS4xODAwMyA0NC44MzY4IDkuMTgwMDNDNDIuNTkyMiA5LjE4MDAzIDQwLjc3MiA3LjM4MTY0IDQwLjc3MiA1LjE2Mzg4QzQwLjc3MiAyLjk0NjEyIDQyLjU5MjIgMS4xNDc3NCA0NC44MzY4IDEuMTQ3NzRDNDcuMDgxNSAxLjE0Nzc0IDQ4LjkwMTcgMi45NDU2IDQ4LjkwMTcgNS4xNjM4OFoiIGZpbGw9IiNGMjhEQkEiLz4NCjxwYXRoIGQ9Ik01OS43NzQ3IDQuOTc2ODRDNTkuNzc0NyA3LjE5NDYgNTcuOTU0NSA4Ljk5Mjk5IDU1LjcwOTkgOC45OTI5OUM1My40NjUyIDguOTkyOTkgNTEuNjQ1IDcuMTk0NiA1MS42NDUgNC45NzY4NEM1MS42NDUgMi43NTkwOCA1My40NjUyIDAuOTYwNjkzIDU1LjcwOTkgMC45NjA2OTNDNTcuOTU0NSAwLjk2MDY5MyA1OS43NzQ3IDIuNzU5MDggNTkuNzc0NyA0Ljk3Njg0WiIgZmlsbD0iI0YyNzU3QyIvPg0KPC9nPg0KPGRlZnM+DQo8Y2xpcFBhdGggaWQ9ImNsaXAwXzI5MDJfNDQ0NzQiPg0KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIzNS41MDMiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDAuMjQ4NTM1KSIvPg0KPC9jbGlwUGF0aD4NCjwvZGVmcz4NCjwvc3ZnPg0K`;

            const transporter = nodemailer.createTransport({
                SES: new AWS.SES({
                    apiVersion: "2010-12-1",
                }),
            });
            transporter.sendMail(
                {
                    from: "noreply@harthapp.com",
                    to: email,
                    subject: subject,
                    html: `  <div style="height: 600px; width: 355px; margin: 50px auto">
                    <img style="height:40px" src="cid:logo">
            <div style="">
              <p
                style="
                  font-family: 'Work Sans';
                  font-style: normal;
                  font-weight: 600;
                  font-size: 18px;
                  line-height: 125%;
                  letter-spacing: 0.02em;
                  /* Fuel */
                  color: #2f1d2a;
                "
              >
                Welcome to Härth
              </p>
              <div
                style="
                  font-family: 'Work Sans';
                  font-style: normal;
                  font-weight: 400;
                  font-size: 12px;
                  line-height: 125%;
                  letter-spacing: 0.02em;

                  /* Fuel */
                  color: #2f1d2a;
                "
              >
                <p>You have successfully registered for an account with the following address: ${email}</p>
                <p>
                  We are thrilled to welcome you as one of the first beta testers for Härth, our innovative take on social
                  that creates a private space for you and your friends. Your valuable feedback and insights will help us
                  fine-tune the experience and ensure that we launch a top-notch product.
                </p>
                <p style="
                  font-weight: 600;
                  ">
                  Here's what you need to know to get started:
                  <ul>
                    <li><span style="font-weight: 600;">Accessing Härth:</span> We recommend that you install Härth as a PWA (Progressive
                      Web App). This is especially important if you are using the app on your mobile device. Don't worry, it's really easy.
                      Visit <a href="https://www.harthsocial.com/pwa">https://www.harthsocial.com/pwa</a> for instrucstions </li>
                    <li><span style="font-weight: 600;">Providing Feedback:</span> Email <a href="mailto:help@harthsocial.com">
                    help@harthsocial.com</a> if you want to send us any feedback or if we experience any issues. When 
                    reporting bugs, please include a detailed description, screenshots or screen recordings (if applicable),
                    and the steps you took leading up to the issue.</li>
                  </ul>
                </p>
                <p>We are excited to embark on this journey with you and look forward to receiving your valuable feedback.
                Together, we'll make Härth the best it can be. Thank you for your support and happy testing!</p>
                <p>Warm Regards,<br/>
                The Härth Team</p>
              </div>

              <div
                style="
                  font-family: 'Work Sans';
                  font-style: normal;
                  font-weight: 400;
                  font-size: 12px;
                  line-height: 125%;

                  /* or 15px */
                  letter-spacing: 0.02em;

                  /* Fuel 50 */
                  color: rgba(47, 29, 42, 0.5);
                "
              >
                <p>
                  This email was sent to ${email}. Please do not reply to this email. This
                  address is not monitored
                </p>
                <div style="display: flex; justify-content: space-between">
                  <a href="https://www.harthsocial.com">www.harthsocial.com</a><a href="https://www.harthsocial.com/terms">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>`,
                    attachments: [
                        {
                            filename: "logo.jpg",
                            content: logo.split("base64,")[1],
                            encoding: "base64",
                            cid: "logo",
                        },
                    ],
                },
                (mailErr, info) => {
                    if (mailErr) {
                        resolve(mailErr);
                    }
                    resolve(info);
                }
            );
        });
    };
    await sendEmail(otp, email, subject);
    return res.json({ msg: "login successful", ok: 1 });
};
