import { FormProvider, useForm } from "react-hook-form";

const Form = (props) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const {
        children,
        data,
        on_submit,
        on_missing,
        id,
        errorData,
        ignoreMissing,
    } = props;

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(children);
        children[0].props.badData = true;
        const inputs = document.getElementById("submit-form").elements;
        let validForm = true;
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].nodeName === "INPUT") {
                let selectedInput = inputs[i];
                let isRequired = selectedInput.dataset.isrequired;
                let selectedValue = selectedInput.value;
                if (isRequired && !selectedValue.trim()) {
                    selectedInput.dataset.bad = true;
                    validForm = false;
                }
            }
        }

        if (validForm) {
            // do good stuff
            // on_submit();
        } else {
        }
    };

    return (
        <form id={id} onSubmit={submitHandler}>
            <p>test</p>
            {children}
        </form>
    );
};

export default Form;
