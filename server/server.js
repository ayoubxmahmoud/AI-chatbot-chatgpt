// Import required modules and libraries
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

// Load environment variables from the .env file
dotenv.config();

// Log the OpenAI API key from the environment variables
console.log(process.env.OPENAI_API_KEY);

// Create an OpenAI API configuration using the API key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create an instance of the OpenAIApi using the configuration
const openai = new OpenAIApi(configuration);

// Create an Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for the application
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// Define a simple GET route for checking if the server is running
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'the server is running',
    });
});

// Define a POST route to handle user prompts and generate AI responses
app.post('/', async (req, res) => {
    try {
        // Extract the user's prompt from the request body
        const prompt = req.body.prompt;

        // Use the OpenAI API to create a text completion
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        // Send the AI's response in the HTTP response
        res.status(200).send({
            bot: response.data.choices[0].text,
        });
    } catch (err) {
        // Handle errors by logging and sending an error response
        console.log(err);
        res.status(500).send({ err });
    }
});

// Start the Express application and listen on port 5000
app.listen(5000, () => console.log('Listening on port http://localhost:5000'));
