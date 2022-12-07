import { useRouter } from "next/router";
import Transition from "./Transition";

const TransitionLayout = ({ children }) => {
    const router = useRouter();
    return (
        <div className="layout">
            <Transition location={router.pathname}>
                <main className="main">{children}</main>
            </Transition>
        </div>
    );
};

export default TransitionLayout;
