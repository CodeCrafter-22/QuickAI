import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import fs from 'fs'
import pdfParse from "pdf-parse";


const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { aiprompt, length } = req.body;

    // Map length value to word range
    let range = "";
    if (length === "short") range = "500–800 words";
    else if (length === "medium") range = "800–1200 words";
    else range = "1200+ words";

    // Build strong AI prompt
    const prompt = input; // only topic

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "user", content: aiPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3500
    });

    console.log("AI Response:", JSON.stringify(response, null, 2));

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return res.json({
        success: false,
        message: "AI returned no content"
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    res.json({ success: true, content });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if(plan !== 'premium' && free_usage >= 10){
        return res.json({ success: false, message: "Limit reached. Upgrade to continue!!"})
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "user", content: prompt, }
      ],
      temperature: 0.7,
      max_tokens: 3500,
    });

    console.log("AI Response:", JSON.stringify(response, null, 2));

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return res.json({
        success: false,
        message: "AI returned no content"
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if(plan !== 'premium'){
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata:{
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};


export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue!!",
      });
    }

    // --------- 1. GENERATE IMAGE USING CLIPDROP ----------
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
        ...formData.getHeaders(),
        "x-api-key": process.env.CLIPDROP_API_KEY
        },

        responseType: "arraybuffer",
      }
    );

    // --------- 2. CONVERT OUTPUT TO BASE64 -------------
    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    // --------- 3. UPLOAD IMAGE TO CLOUDINARY -----------
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "quickai",
    });

    const imageUrl = uploadResult.secure_url;

    // --------- 4. INSERT INTO DATABASE ----------------
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${imageUrl}, 'image', ${publish ?? false});
    `;

    // --------- 5. UPDATE USER FREE USAGE --------------
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    // --------- 6. SEND RESPONSE ------------------------
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {image} = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue!!",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(image.path, {
      folder: "quickai",
      transformation: [
        {
            effect: 'background_removal',
            background_removal: 'remove_the_background'
        }
      ]
    });

    const imageUrl = uploadResult.secure_url;
    
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${imageUrl}, 'image');
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    
    res.json({ success: true, content: imageUrl });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const {image} = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions!",
      });
    }

    const {public_id} = await cloudinary.uploader.upload(image.path);

    const imageUr = cloudinary.url(public_id, {
        transformation: [{effect: `gen_remove:${object}`}],
        resource_type: 'image'
    })

    const imgUr = uploadResult.secure_url;
    
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUr}, 'image')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content: imageUr });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions!",
      });
    }

    if(resume.size > 5 * 1024 *1024){
      return res.json({success: false, message: "Resume file size exceeds allowed size (5MB)."})
    }

    const dataBuffer = fs.readFileSync(resume.path)
    const pdfData = await pdfParse(dataBuffer)

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices?.[0]?.message?.content;
    
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content: content });
    
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};