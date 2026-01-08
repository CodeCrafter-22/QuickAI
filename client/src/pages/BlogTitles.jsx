import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

const BlogTitles = () => {

  const blogCategories = [
    'General', 'Technology', 'Buisiness', 'Health', 'Lifestle', 'Education', 'Travel', 'Food']
  
    const [selectedCatagory, setSelectedCatagory] = useState('General')
    const [input, setInput] = useState('')
  
    const onSubmitHandler = async (e) => {
      e.preventDefault();
    }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start gap-6 text-slate-700'>

      {/* LEFT COLUMN */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='The future of Artificial Intelligence is.... '
          required
        />

        <p className='mt-4 text-sm font-medium'>Catagory</p>

        <div className='mt-3 flex gap-3 flex-wrap'>
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCatagory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer 
                ${selectedCatagory === item 
                  ? 'bg-purple-50 text-blue-700 border-purple-700' 
                  : 'text-gray-500 border-gray-300'
                }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <Hash className='w-5'/>
          Generate Title
        </button>

      </form>

      {/* RIGHT COLUMN */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 flex flex-col'>
        
        {/* Header */}
        <div className='flex items-center gap-3 mb-6'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated Titles</h1>
        </div>

        {/* Empty state centered */}
        <div className='flex-1 flex flex-col justify-center items-center text-gray-400 text-sm gap-5'>
          <Hash className='w-10 h-10' />
          <p>Enter a topic and click "Generated Title" to get started</p>
        </div>

      </div>

    </div>
  )
}

export default BlogTitles