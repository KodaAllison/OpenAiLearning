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
		{ role: 'assistant', content: 'You are a top soccer pundit in the UK' },
		{
			role: 'user',
			content: `Provide a list of 3 footballers who are comparable in position and skill. Format the response as a JSON array with each player's first name, last name, date of birth (in YYYY-MM-DD format), and nationality. Example format:
      [
        {
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1990-01-01",
          "nationality": "English"
        },
        ...
      ]`,
		},
	],
});

try {
	// Extract the content of the response and clean it from markdown or extra text
	const rawContent = response.choices[0].message.content || '';
	
	// Attempt to extract JSON from the content
	const jsonString = rawContent.match(/```json([\s\S]*?)```/)?.[1] || rawContent;
	
	// Parse the cleaned JSON string
	const players = JSON.parse(jsonString.trim());
	
	// Sort players by last name (you can change this to sort by another field if needed)
	players.sort((a: { lastName: string }, b: { lastName: string }) =>
		a.lastName.localeCompare(b.lastName)
	);
	
	// Log the sorted players
	console.log(JSON.stringify(players, null, 2));
} catch (error) {
	console.error('Failed to parse the response as JSON or sort it:', error);
}
