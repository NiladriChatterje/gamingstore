import { Link } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { useEffect, useRef, useState } from 'react';

const SideBar = () => {
    const ref = useRef<any>(null);
    let previous = useRef<number>(0);
    const [linkNo, setLinkNo] = useState<number>(0);

    useEffect(() => {
        if (ref.current?.children) {
            if (ref.current.children[previous.current]) {
                ref.current.children[previous.current].classList.remove(styles.Links);
            }
            if (ref.current.children[linkNo]) {
                ref.current.children[linkNo].classList.add(styles.Links);
            }
        }
    }, [linkNo]);

    const items = [
        { label: 'Overview', to: '/admin' },
        { label: 'Orders', to: '/admin/orders' },
        { label: 'Sales', to: '/admin/sales' },
        { label: 'Profile', to: '/admin/edit-profile' },
        { label: 'Add Product', to: '/admin/add-product' },
        { label: 'Edit Product', to: '/admin/edit-product' },
        { label: 'Store Management', to: '/admin/stores' },
        { label: 'Subscription', to: '/admin/subscription' },
        { label: 'Payout', to: '/admin/payout' },
    ];

    return (
        <aside ref={ref} id={styles['aside-container']}>
            {items.map((item, i) => (
                <Link
                    key={item.to}
                    onClick={() => { previous.current = linkNo; setLinkNo(i) }}
                    to={item.to}
                >
                    <div>{item.label}</div>
                </Link>
            ))}
        </aside>
    )
}

export default SideBar