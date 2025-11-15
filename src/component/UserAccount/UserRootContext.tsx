import UserAccount from "./UserAccount";
import { UserStateContext } from "./UserStateContext";
import { useRouteTracker } from "../../hooks/useRouteTracker";

const UserRootContext = () => {
    // Track route changes and update localStorage
    useRouteTracker();

    return (
        <UserStateContext>
            <UserAccount />
        </UserStateContext>);
};

export default UserRootContext;
