import Groq from "groq-sdk";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import fs from "fs";
import pdfParse from "pdf-parse";

// Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ================== GENERATE ARTICLE ==================
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { aiprompt, length } = req.body;

    let range = "";
    if (length === "short") range = "500–800 words";
    else if (length === "medium") range = "800–1200 words";
    else range = "1200+ words";

    const prompt = `${aiprompt}. Write an article of ${range}.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content;

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

// ================== GENERATE BLOG TITLE ==================
export const generateBlogTitle = async (req, res) => {
  try {
    const userId = "test-user";
    const { prompt } = req.body;

    const plan = "free";        // ✅ FIX
    const free_usage = 0;       // ✅ FIX

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate 5 catchy blog titles for: ${prompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content;

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

// ================== GENERATE IMAGE ==================
export const generateImage = async (req, res) => {
  try {
    const userId = "test-user";
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue!!",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "quickai",
    });

    const imageUrl = uploadResult.secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${imageUrl}, 'image', ${publish ?? false});
    `;

    //if (plan !== "premium") {
      //await clerkClient.users.updateUserMetadata(userId, {
        //privateMetadata: {
          //free_usage: free_usage + 1,
        //},
      //});
    //}

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ================== REMOVE IMAGE BACKGROUND ==================
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
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
      transformation: [{ effect: "background_removal" }],
    });

    const imageUrl = uploadResult.secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Removed background', ${imageUrl}, 'image');
    `;

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ================== REMOVE OBJECT ==================
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    // ✅ GET PLAN FROM CLERK
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || "free";

    console.log("PLAN:", plan); // 🔍 debug

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Premium feature only!",
      });
    }

    if (!image) {
      return res.json({
        success: false,
        message: "Image not uploaded",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object}`}, ${imageUrl}, 'image')
    `;

    res.json({ success: true, content: imageUrl });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ================== RESUME REVIEW ==================
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Premium feature only!",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `
    Analyze this resume and give structured feedback:

    1. ATS Score (out of 100)
    2. Strengths (bullet points)
    3. Weaknesses (bullet points)
    4. Improvements (bullet points)
    5. Final Summary (short paragraph)

    Resume:
    ${pdfData.text}
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const content = completion.choices[0]?.message?.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Resume Review', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};