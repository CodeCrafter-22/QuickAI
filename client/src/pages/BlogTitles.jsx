import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'

const BlogTitles = () => {

  const blogCategories = [
    'General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'
  ]

  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Button clicked ✅");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/api/ai/generate-blog-title",
        {
          prompt: `${input} (${selectedCategory})`
        }
      );

      console.log(res.data);

      if (res.data.success) {
        // Convert response into list
        const resultArray = res.data.content.split("\n").filter(item => item.trim() !== "");
        setTitles(resultArray);
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start gap-6 text-slate-700'>

      {/* LEFT */}
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
          placeholder='The future of Artificial Intelligence is....'
          required
        />

        <p className='mt-4 text-sm font-medium'>Category</p>

        <div className='mt-3 flex gap-3 flex-wrap'>
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer 
                ${selectedCategory === item 
                  ? 'bg-purple-50 text-blue-700 border-purple-700' 
                  : 'text-gray-500 border-gray-300'
                }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          type="submit"
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          <Hash className='w-5'/>
          {loading ? "Generating..." : "Generate Title"}
        </button>

      </form>

      {/* RIGHT */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 flex flex-col'>

        <div className='flex items-center gap-3 mb-6'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated Titles</h1>
        </div>

        {titles.length === 0 ? (
          <div className='flex-1 flex flex-col justify-center items-center text-gray-400 text-sm gap-5'>
            <Hash className='w-10 h-10' />
            <p>Enter a topic and click "Generate Title"</p>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {titles.map((title, index) => (
              <p key={index} className='p-2 border rounded-md text-sm'>
                {title}
              </p>
            ))}
          </div>
        )}

      </div>

    </div>
  )
}

export default BlogTitles