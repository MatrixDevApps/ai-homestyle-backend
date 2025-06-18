const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("AI HomeStyle Backend is running!");
});

app.post("/api/generate", async (req, res) => {
  try {
    const { imageUrl, prompt, negative_prompt, num_inference_steps, guidance_scale, prompt_strength, seed } = req.body;

    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "7f604efcd4f442f61281f6161e49bd5b94836b07fc1bb578d64c7b7f4db8a64a",
        input: {
          image: imageUrl,
          prompt: prompt,
          negative_prompt: negative_prompt || "lowres, watermark, text, blurry",
          num_inference_steps: num_inference_steps || 50,
          guidance_scale: guidance_scale || 15,
          prompt_strength: prompt_strength || 0.8,
          seed: seed || null
        }
      })
    });

    const data = await replicateResponse.json();

    if (data.error) {
      console.error("Replicate error:", data.error);
      return res.status(500).json({ error: data.error });
    }

    res.json(data);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`AI HomeStyle backend running on port ${port}`);
});