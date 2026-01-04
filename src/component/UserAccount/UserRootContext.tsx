import UserAccount from "./UserAccount";
import { UserStateContext } from "./UserStateContext";

const UserRootContext = () => {

    return (
        <UserStateContext>
            <UserAccount />
        </UserStateContext>);
};

export default UserRootContext;
