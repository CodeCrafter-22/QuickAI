import { Eraser, Sparkles } from 'lucide-react';
import React, { useState } from 'react'

const RemoveBackground = () => {

  const [input, setInput] = useState('')

  const onSubmitHandler = async (e) => {
        e.preventDefault();
    }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start gap-6 text-slate-700'>

      {/* LEFT COLUMN */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#FF3948]' />
          <h1 className='text-xl font-semibold'>Background Remover</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          
          type="file" accept='image/*'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          
          required
        />

        <p className='text-xs text-gray-500 font-light mt-1'>Supports JPG. PNG, and other image formats</p>

        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF3948] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <Eraser className='w-5'/>
          Remove Background
        </button>

      </form>

      {/* RIGHT COLUMN */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 flex flex-col'>
        
        {/* Header */}
        <div className='flex items-center gap-3 mb-6'>
          <Eraser className='w-5 h-5 text-[#FF3948]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>

        {/* Empty state centered */}
        <div className='flex-1 flex flex-col justify-center items-center text-gray-400 text-sm gap-5'>
          <Eraser className='w-10 h-10' />
          <p>Upload an image and click "Remove Background" to get started</p>
        </div>

      </div>

    </div>
  )
}

export default RemoveBackground