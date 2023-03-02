import React from 'react'
import { useLocation } from 'react-router'

const Details = ({item}) => {
  const {id} = useLocation();
  console.log(id);
  return (
    <div>
      <img src={item?.img} alt={item?.name} />
    </div>
  )
}

export default Details