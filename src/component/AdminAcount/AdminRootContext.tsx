import { SignedIn } from "@clerk/clerk-react"
import AdminAccount from "./AdminAccount"
import { AdminStateContext } from "./AdminStateContext"
import { useRouteTracker } from "../../hooks/useRouteTracker"


const AdminRootContext = () => {
    // Track route changes and update localStorage
    useRouteTracker();

    return (
        <AdminStateContext>
            <SignedIn>
                <AdminAccount />
            </SignedIn>
        </AdminStateContext>
    )
}

export default AdminRootContext