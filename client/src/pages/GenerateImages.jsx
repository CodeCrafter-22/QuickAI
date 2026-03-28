import { Image, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from "axios";

const GenerateImages = () => {

  const imageStyle = [
    'Realistic', 'Ghibli Style', 'Anime Style', 'Cartoon Style',
    'Fantasy Style', 'Realistic Style', '3D Style', 'Portrait Style'
  ]

  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setImageUrl("");

      const { data } = await axios.post(
        "http://localhost:3000/api/ai/generate-image",
        {
          prompt: `${input} in ${selectedStyle}`,
          publish: publish,
        }
      );

      if (data.success) {
        setImageUrl(data.imageUrl);
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log("ERROR:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start gap-6 text-slate-700'>

      {/* LEFT COLUMN */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Describe your image</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='Describe what you want to see in the image.... '
          required
        />

        <p className='mt-4 text-sm font-medium'>Style</p>

        <div className='mt-3 flex gap-3 flex-wrap'>
          {imageStyle.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer 
                ${selectedStyle === item 
                  ? 'bg-green-50 text-green-700 border-green-700' 
                  : 'text-gray-500 border-gray-300'
                }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative inline-block w-9 h-5 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setPublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>
            <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4"></span>
          </label>

          <p className="text-sm">Make this Image Public</p>
        </div>

        <button
          type="submit"
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          <Image className='w-5'/>
          {loading ? "Generating..." : "Generate Image"}
        </button>

      </form>

      {/* RIGHT COLUMN */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 flex flex-col'>
        
        <div className='flex items-center gap-3 mb-6'>
          <Image className='w-5 h-5 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Generated Image</h1>
        </div>

        {/* SHOW IMAGE */}
        {loading ? (
          <div className='flex-1 flex justify-center items-center text-gray-400'>
            Generating image...
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Generated" className='rounded-lg' />
        ) : (
          <div className='flex-1 flex flex-col justify-center items-center text-gray-400 text-sm gap-5'>
            <Image className='w-10 h-10' />
            <p>Enter a topic and click "Generate Image" to get started</p>
          </div>
        )}

      </div>

    </div>
  )
}

export default GenerateImages;