const sanitize = require("mongo-sanitize");
const { Configuration, OpenAIApi } = require("openai");
const authWrapper = require("../middleware/auth");
const User = require("../models/User");

//
const genSuggestion = authWrapper(async (req, res) => {
  const {
    prompt,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = req.body;

  console.log('initially');

  const configuration = new Configuration({
    apiKey: process.env.OAI,
  });
  const openai = new OpenAIApi(configuration);

  console.log('testing2')

  const response1 = await openai.createCompletion({
    model: "text-curie-001",
    prompt,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  });

  console.log(response1);

  const received_data = response1.data.choices[0].text;

  console.log(received_data);

  const tokensGenerated = received_data.length / 4;

  try {

    req.user = sanitize(req.user);

    const user = await User.findOne({ _id: req.user.id });

    let currPoints = user.aiPoints;

    let finalPoints = currPoints + tokensGenerated;
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { aiPoints: finalPoints },
      { new: true }
    );

    res.status(200).json({
      data: response1.data.choices[0].text,
      aiPoints: updatedUser.aiPoints,
    });
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server ERror");
  }
});

module.exports = {
  genSuggestion,
};
