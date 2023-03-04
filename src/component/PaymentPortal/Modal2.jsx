import React, {  useRef } from 'react';
import './Modal2.css';
import toast, {Toaster} from 'react-hot-toast'
import {TiTick} from 'react-icons/ti'
import {FaEdit} from 'react-icons/fa'
import {useNavigate} from 'react-router'

const Modal2 = ({setModal2})=>{
const sixRef = useRef();
const navigate=useNavigate();

toast(`Already an User : ${JSON.parse(localStorage.getItem('user'))?.name}`)
return <div id={'modal-container'}>
     <Toaster />
     <div id={'modal2'}>
        <FaEdit 
        onClick={()=>setModal2(false)}
        style={{position:'fixed',right:10,top:10,cursor:'pointer'}}/>
    <span style={{color:'black'}}>Already an User <TiTick /></span>
    <button onClick={()=>navigate('/')}>
        Redirect to Payment Page
    </button>
     </div>
 </div>
}
export default Modal2;