import { SignedIn } from "@clerk/clerk-react"
import AdminAccount from "./AdminAccount"
import { AdminStateContext } from "./AdminStateContext"


const AdminAccountRoot = () => {
    return (
        <AdminStateContext>
            <SignedIn>
            <AdminAccount />
            </SignedIn>
        </AdminStateContext>
    )
}

export default AdminAccountRoot