import React from 'react'
import './Products.css';
import { motion } from 'framer-motion';
import {FixedSizeList} from 'react-window'
const ProductDetails = React.lazy(()=>import('../ProductDetails/ProductDetails'));

const data=[
    {   id:1,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:2,
        name:'XBOX 360',
        price:'7000',
        image:'https://pngimg.com/uploads/xbox/xbox_PNG17514.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:3,
        name:'XBOX 360 DVD/CD',
        price:'1200',
        image:'https://upload.wikimedia.org/wikipedia/commons/2/2a/Xbox_360_HD-DVD_Drive.png',
        desc:'Read speed upto 1900MB/s and write speed upto 1000 MB/s',
    },
    {   id:4,
        name:'HARD 1457WF XBOX controller',
        price:'660',
        image:'https://pngimg.com/uploads/xbox/xbox_PNG101370.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:5,
        name:'Freedom Fighters',
        price:'660',
        image:'https://img.favpng.com/6/16/10/freedom-fighters-playstation-2-xbox-360-gamecube-video-game-png-favpng-cbSnVN7UZATcK4mpSSJpxGuGy.jpg',
        desc:'Third Person shooter perspective game with super',
    },
    {   id:6,
        name:'Assassin\'s Creed 2',
        price:'660',
        image:'https://www.dvd-covers.org/d/4852-5/Assassin_s_Creed.jpg',
        desc:'Ubisoft\'s best game ever',
    },
    {   id:7,
        name:'Assassin\'s Creed Black Flag',
        price:'660',
        image:'https://i.pinimg.com/originals/a3/66/46/a366465c1b9faa7bf4f0ced6ca667f3e.jpg',
        desc:'How Pirates is indulged himself into evacuations',
    },
    {   id:8,
        name:'NBA 2K12',
        price:'499',
        image:'https://m.media-amazon.com/images/I/518rGz3rVmL._AC_SY1000_.jpg',
        desc:'Wonderful socket with stunning look',
    },
    {   id:9,
        name:'Tomb Raider 1',
        price:'759',
        image:'https://m.media-amazon.com/images/I/91d3g549m7L._SY500_.jpg',
        desc:'Lara Crafts involvement into exploration of ',
    },
    {   id:10,
        name:'FIFA 17',
        price:'1399',
        image:'https://i.ebayimg.com/images/g/VjoAAOSwezFi6TPY/s-l500.png',
        desc:'International Federation of Association Football ',
    },
    {   id:11,
        name:'Crysis 3',
        price:'1260',
        image:'https://m.media-amazon.com/images/I/518rK5O4nqL.jpg',
        desc:'Wonderful socket with stunning look',
    },
    {   id:12,
        name:'Crysis 2 [CRYNET]',
        price:'729',
        image:'https://m.media-amazon.com/images/I/51wJSXesqYL.jpg',
        desc:'Wonderful socket with stunning look',
    },
    {   id:13,
        name:'Gear of War 3',
        price:'2630',
        image:'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1f10ac44-e810-4196-bf8a-529f1016a6e9/d4bgikf-3d8ca665-5965-4289-825d-f5bdaca23a3b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzFmMTBhYzQ0LWU4MTAtNDE5Ni1iZjhhLTUyOWYxMDE2YTZlOVwvZDRiZ2lrZi0zZDhjYTY2NS01OTY1LTQyODktODI1ZC1mNWJkYWNhMjNhM2IucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.ueA5CPqBoDfT37DhdtuURQbOaZU_mdzURn2UAUkTtNU',
        desc:'Wonderful socket with stunning look',
    },
    {   id:14,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:15,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:16,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:17,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:18,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:19,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:20,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:21,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:22,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:23,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
    {   id:24,
        name:'Controller',
        price:'660',
        image:'https://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/Xbox-One-Controller-icon.png',
        desc:'Wonderful socket with stunning look',
    },
];
const Products = () => {
    

    const Row = ({index,style})=>{
        return <div style={{...style,left:'50%',
        width:'300px',position:'absolute',transform:'translateX(-50%)'}}>
            <React.Suspense fallback={<div className="loader"></div>}>
        <ProductDetails style={style} item={data[index]} /></React.Suspense>
        </div> }


  return (
    <motion.div
        id={'Product-container'}
        initial={{x:300}}
        animate={{x:0}}>
        <FixedSizeList
            height={window.innerHeight-70}
            width={window.innerWidth}
            itemCount={data.length}
            itemSize={500}
           
        >
        {Row}
        </FixedSizeList>
        
    </motion.div>
  )
}

export default Products