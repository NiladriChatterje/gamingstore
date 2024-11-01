import { FormEvent, useState } from 'react';
import styles from './ProfileManager.module.css';
import { MdEdit } from "react-icons/md";


const ProfileManager = () => {
    const [usernameDisable, setUsernameDisable] = useState<boolean>(true);

    async function handleUpdate(e: FormEvent) {
        e.preventDefault();


    }

    return (
        <div id={styles['']}>
            <form onSubmit={handleUpdate}>
                <div>
                    <input name={'username'} placeholder='username'
                        disabled={usernameDisable} />
                    <MdEdit
                        onClick={() => { setUsernameDisable(prev => !prev) }}
                    />
                </div>
                <div>
                    <select>
                        <option value={91}>India</option>
                        <option value={144}>America</option>
                        <option value={92}>Pakistan</option>
                    </select>
                    <input name={'phone'} placeholder='phone'
                        disabled={usernameDisable} />
                    <MdEdit
                        onClick={() => { setUsernameDisable(prev => !prev) }}
                    />
                </div>
            </form>
        </div>
    )
}

export default ProfileManager