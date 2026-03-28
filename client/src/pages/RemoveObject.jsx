import { Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from "axios";

const RemoveObject = () => {

  const [input, setInput] = useState(null)
  const [object, setObject] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input) {
      alert("Please upload an image");
      return;
    }

    try {
      setLoading(true);
      setImageUrl("");

      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "http://localhost:3000/api/ai/remove-image-object",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(data);

      if (data.success) {
        // ✅ FIX: set correct image URL
        setImageUrl(data.content);
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start gap-6 text-slate-700'>

      {/* LEFT COLUMN */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />

        <p className='mt-6 text-sm font-medium'>Describe object name to remove</p>

        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='e.g: watch or spoon'
          required
        />

        <button
          type="submit"
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50'
        >
          <Scissors className='w-5'/>
          {loading ? "Processing..." : "Remove Object"}
        </button>

      </form>

      {/* RIGHT COLUMN */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96 flex flex-col'>
        
        <div className='flex items-center gap-3 mb-6'>
          <Scissors className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>

        {loading ? (
          <div className='flex-1 flex justify-center items-center text-gray-400'>
            Processing image...
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Processed"
            className='rounded-lg w-full object-contain'
          />
        ) : (
          <div className='flex-1 flex flex-col justify-center items-center text-gray-400 text-sm gap-5'>
            <Scissors className='w-10 h-10' />
            <p>Upload an image and click "Remove Object" to get started</p>
          </div>
        )}

      </div>

    </div>
  )
}

export default RemoveObject