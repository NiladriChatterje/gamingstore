import { SignedIn } from "@clerk/clerk-react"
import AdminAccount from "./AdminAccount"
import { AdminStateContext } from "./AdminStateContext"


const AdminRootContext = () => {

    return (
        <AdminStateContext>
            <SignedIn>
                <AdminAccount />
            </SignedIn>
        </AdminStateContext>
    )
}

export default AdminRootContext