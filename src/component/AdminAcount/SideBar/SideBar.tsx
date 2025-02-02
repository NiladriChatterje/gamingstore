import { Link } from 'react-router-dom'
import styles from './Sidebar.module.css'

const SideBar = () => {
    return (
        <aside id={styles['aside-container']}>
            <Link to={'/admin'}><div>Overview</div></Link>
            <Link to={'/admin/edit-profile'}><div>Profile</div></Link>
            <Link to={'/admin/edit-bank'}><div>Sales</div></Link>
            <Link to={'/admin/orders'}><div>Orders</div></Link>
            <Link to={'/admin/add-product'}><div>Add Product</div></Link>
            <Link to={'/admin/edit-product'}><div>Edit Product</div></Link>
            <Link to={'/admin/edit-bank'}><div>Connect Wallet</div></Link>
        </aside>
    )
}

export default SideBar