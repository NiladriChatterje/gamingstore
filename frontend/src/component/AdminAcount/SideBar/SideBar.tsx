import { Link } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { useEffect, useRef, useState } from 'react';

const SideBar = () => {
    const ref = useRef<any>(null);
    let previous = useRef<number>(0);
    const [linkNo, setLinkNo] = useState<number>(0);

    useEffect(() => {
        ref.current.children[previous.current].classList.remove(styles.Links);
        ref.current.children[linkNo].classList.add(styles.Links);
    }, [linkNo]);

    return (
        <aside ref={ref} id={styles['aside-container']}>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(0) }} to={'/admin'}><div>Overview</div></Link>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(1) }} to={'/admin/orders'}><div>Orders</div></Link>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(2) }} to={'/admin/edit-profile'}><div>Profile</div></Link>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(3) }} to={'/admin/edit-bank'}><div>Sales</div></Link>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(4) }} to={'/admin/add-product'}><div>Add Product</div></Link>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(5) }} to={'/admin/edit-product'}><div>Edit Product</div></Link>
            <Link onClick={() => { previous.current = linkNo; setLinkNo(6) }} to={'/admin/edit-bank'}><div>Connect Wallet</div></Link>
        </aside>
    )
}

export default SideBar