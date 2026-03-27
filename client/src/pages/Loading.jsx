
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Loading = () => {

const navigate= useNavigate();

useEffect(()=>{
    const timeout = setTimeout(()=>{
       navigate('/')
    }, 10000);
    return () => clearTimeout(timeout)
}, [navigate])

  return (
    <div className='flex items-center justify-center h-screen w-screen text-white text-2xl'>
       <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500'>
          <h1 className='text-lg font-semibold'>Loading...</h1>
       </div>
    </div>
  )
}

export default Loading