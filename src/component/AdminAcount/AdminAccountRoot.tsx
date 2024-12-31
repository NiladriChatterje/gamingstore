import AdminAccount from "./AdminAccount"
import { AdminStateContext } from "./AdminStateContext"


const AdminAccountRoot = () => {
    return (
        <AdminStateContext>
            <AdminAccount />
        </AdminStateContext>
    )
}

export default AdminAccountRoot