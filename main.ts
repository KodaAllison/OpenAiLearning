import '@std/dotenv/load';
import { load } from 'https://deno.land/std@0.210.0/dotenv/mod.ts';
import OpenAI from 'https://deno.land/x/openai@v4.53.0/mod.ts';

const env = await load();

const openaiApiKey = env['OPENAI_API_KEY'];

if (!openaiApiKey) {
	throw new Error('The OPENAI_API_KEY environment variable is missing or empty');
}

const client = new OpenAI({ apiKey: openaiApiKey });

const response = await client.chat.completions.create({
	model: 'gpt-4o-mini',
	messages: [
		{ role: 'assistant', content: 'You are very knowledgeable about the world and what youth like to do' },
		{
			role: 'user',
			content: `Provide a list of 5 places where it is 5am with some details. Example format:
      [
        {
          "country": "England",
          "city": "Newcastle",
          "favouriteBeer": "Stella",
          "goodBar": "The Hancock"
        },
        ...
      ]`,
		},
	],
});

try {
	// Extract the content of the response
	const rawContent = response.choices?.[0]?.message?.content || '';
	
	// Check if the response contains a code block or plain JSON, and extract accordingly
	const jsonStringMatch = rawContent.match(/```json([\s\S]*?)```/);
	const jsonString = jsonStringMatch ? jsonStringMatch[1] : rawContent;

	// Parse the JSON string
	const places = JSON.parse(jsonString.trim());

	if (!Array.isArray(places) || places.length === 0) {
		throw new Error('The response does not contain a valid array of places.');
	}

	// Sort the places by city name, ensuring each place has a valid 'city' field
	places.sort((a: { city?: string }, b: { city?: string }) => {
		if (!a.city || !b.city) {
			throw new Error('Missing "city" field in one or more places.');
		}
		return a.city.localeCompare(b.city);
	});

	// Log the sorted places
	console.log(JSON.stringify(places, null, 2));
} catch (error) {
	console.error('Failed to parse the response or sort the data:', error);
}
