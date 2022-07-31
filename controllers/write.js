const { Configuration, OpenAIApi } = require("openai");
const authWrapper = require("../middleware/auth");
const User = require("../models/User");

const genSuggestion = authWrapper(async (req, res) => {
  const {
    prompt,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = req.body;

  const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);

  const response1 = await openai.createCompletion({
    model: "text-curie-001",
    prompt,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  });

  const received_data = response1.data.choices[0].text;

  const tokensGenerated = received_data.length / 4;

  try {

    const user = await User.findOne({ _id: req.user.id });

    let currTokens = user.tokens;

    let finalTokens = currTokens + tokensGenerated;
    
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { tokens: finalTokens },
      { new: true }
    );

    res.status(200).json({
      data: response1.data.choices[0].text,
      tokens: updatedUser.tokens,
    });
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server ERror");
  }
});

module.exports = {
  genSuggestion,
};
