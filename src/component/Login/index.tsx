import { useState } from "react";
import AdminLogin from "./AdminLogin"
import CustomerLogin from "./CustomerLogin"

const index = () => {
    const [userToggle, _] = useState<boolean>(false);
    return (
        <div>
            {userToggle ?
                <AdminLogin /> : <CustomerLogin />
            }
        </div>
    )
}

export default index;