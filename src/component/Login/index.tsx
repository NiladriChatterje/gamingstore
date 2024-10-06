import { useState } from "react";
import AdminLogin from "./AdminLogin"
import CustomerLogin from "./CustomerLogin"

const Index = () => {
    const [userToggle, _] = useState<boolean>(false);
    return (
        <div>
            {userToggle ?
                <AdminLogin /> : <CustomerLogin />
            }
        </div>
    )
}

export default Index;