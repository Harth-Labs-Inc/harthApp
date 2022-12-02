import { useRef, useState } from "react";
import { useComms } from "../../contexts/comms";
import { generateInvite, getInviteById } from "../../requests/community";

import { Button } from "../Common";
import Select from "react-select";

const InviteComp = (props) => {
    const { comms, selectedcomm } = useComms();
    const [selectedHarth, setSelectedHarth] = useState("");
    const [invites, setInvites] = useState({});
    const codeRef = useRef();

    const { toggleCurrentPage } = props;

    let selectedInvite;
    let expiredTime;
    let urls = {
        development: "http://localhost:3000/",
        production: "https://project-blarg-next.vercel.app/",
    };
    let inviteUrl;
    for (let [key, value] of Object.entries(invites)) {
        if (key === selectedHarth) {
            expiredTime =
                24 -
                Math.abs(
                    new Date(value.expiration).getHours() -
                        new Date().getHours()
                );
            selectedInvite = value;
            inviteUrl = `${urls[process.env.NODE_ENV]}?invite=true&tkn=${
                selectedInvite.token
            }`.trim();
        }
    }

    const options = [];

    const createInvite = async (e) => {
        e.preventDefault();
        const data = await generateInvite(selectedHarth);
        const { ok, invite } = data;
        if (ok) {
            setInvites({ ...invites, [invite.comm_id]: invite });
        }
    };

    const changeSelectedHarth = async ({ value }) => {
        let invt = await getInviteById(value);
        console.log(invt);
        let { ok, invite } = invt;
        if (ok) {
            setInvites({ ...invites, [invite.comm_id]: invite });
        }
        setSelectedHarth(value);
    };

    const copyInviteToClipboard = () => {
        codeRef.current.select();
        document.execCommand("copy");
    };

    comms &&
        comms.map((com) => {
            options.push({
                value: com._id,
                label: (
                    <span>
                        <span className="option-image-wrapper">
                            {com.iconKey ? <img src={com.iconKey} /> : ""}
                        </span>{" "}
                        {com.name}
                    </span>
                ),
            });
        });

    const customStyles = {
        option: (styles, { isSelected }) => ({
            ...styles,
            color: "#333",
            backgroundColor: isSelected ? "#f7f7f7" : "",
            padding: 0,
        }),
    };

    return (
        <>
            <div id="harth_invite_header">
                <button id="go_back" onClick={() => toggleCurrentPage("")}>
                    back
                </button>
                <span>Invites</span>
            </div>

            <form onSubmit={createInvite} id="harth_invite_form">
                <div className="invite-select-wrapper">
                    <Select
                        className="harth-invite-select"
                        classNamePrefix="harth-invite-select"
                        placeholder="Select a H&auml;rth"
                        options={options}
                        styles={customStyles}
                        onChange={changeSelectedHarth}
                        value={(options || []).filter((option) => {
                            if (option.value === selectedHarth) {
                                return {
                                    value: option.value,
                                    label: option.value,
                                };
                            }
                        })}
                    />
                </div>
                {selectedInvite ? (
                    <>
                        <div className="invite-code">
                            <p>{selectedInvite.token}</p>
                            <textarea
                                readOnly
                                value={inviteUrl}
                                ref={codeRef}
                            ></textarea>
                        </div>
                        <p>
                            Invite link will remain active for the next{" "}
                            {expiredTime} hours
                        </p>
                        <Button
                            text="Copy Invite"
                            onClick={copyInviteToClipboard}
                            type="button"
                        ></Button>
                    </>
                ) : (
                    <Button type="submit" text="Create Invite" />
                )}
            </form>
        </>
    );
};

export default InviteComp;
