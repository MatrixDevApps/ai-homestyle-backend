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
    const { image, prompt, negative_prompt, num_inference_steps, guidance_scale, prompt_strength, seed } = req.body;

    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
        input: {
          image: image,
          prompt: prompt,
          negative_prompt: negative_prompt || "lowres, watermark, blurry, out of focus",
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

// NEW ENDPOINT - Add this here
app.get('/api/result/:predictionId', async (req, res) => {
  try {
    const { predictionId } = req.params;
    
    if (!predictionId) {
      return res.status(400).json({ error: 'Prediction ID is required' });
    }

    console.log(`🔍 Fetching result for prediction: ${predictionId}`);

    const replicateResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!replicateResponse.ok) {
      console.error(`❌ Replicate API error: ${replicateResponse.status}`);
      return res.status(replicateResponse.status).json({ 
        error: `Failed to fetch prediction: ${replicateResponse.status}` 
      });
    }

    const predictionData = await replicateResponse.json();
    console.log(`📊 Prediction status: ${predictionData.status}`);
    
    res.json(predictionData);

  } catch (error) {
    console.error('❌ Error fetching prediction result:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`AI HomeStyle backend running on port ${port}`);
});
