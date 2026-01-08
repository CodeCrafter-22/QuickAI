import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
const WriteArticle = () => {

  const articleLength = [
  { value: "short", text: "Short (500-800 words)" },
  { value: "medium", text: "Medium (800-1200 words)" },
  { value: "long", text: "Long (1200+ words)" }
];

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const {getToken} = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = input;

      const {data} = await axios.post('/api/ai/generate-article', {prompt: input, length:selectedLength.value}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })

      if(data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start gap-6 text-slate-700'>

      {/* LEFT COLUMN */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Article Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='The future of Artificial Intelligence is.... '
          required
        />

        <p className='mt-4 text-sm font-medium'>Article Length</p>

        <div className='mt-3 flex gap-3 flex-wrap'>
          {articleLength.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer 
                ${selectedLength.text === item.text 
                  ? 'bg-blue-50 text-blue-700 border-blue-300' 
                  : 'text-gray-500 border-gray-300'
                }`}
            >
              {item.text}
            </span>
          ))}
        </div>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            : <Edit className='w-5' />
          }
          Generate Article
        </button>

      </form>

      {/* RIGHT COLUMN */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 max-h-[600px] flex flex-col'>
        
        {/* Header */}
        <div className='flex items-center gap-3 mb-6'>
          <Edit className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Generated Article</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-gray-400 text-sm gap-5'>
            <Edit className='w-10 h-10' />
            <p>Enter a topic and click "Generate Article" to get started</p>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-sroll text-sm text-slate-600'>
            <div>{content}</div>

          </div>
        )}
        

      </div>

    </div>
  )
}

export default WriteArticle
