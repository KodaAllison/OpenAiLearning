import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { writeCSV } from "https://deno.land/x/csv@v0.8.0/mod.ts";

const headers = {
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
};

const page = "https://www.transfermarkt.co.uk/manchester-united/startseite/verein/985";
const response = await fetch(page, { headers });
const pageText = await response.text();

const doc = new DOMParser().parseFromString(pageText, "text/html");

if (!doc) {
	throw new Error("Failed to parse HTML document.");
}

const PlayersList: string[] = [];
const AgeList: string[] = [];
const PositionsList: string[] = [];
const NationList: string[] = [];
const ValuesList: string[] = [];

const Players = doc.querySelectorAll("img.bilderrahmen-fixed.lazy.lazy");
const Age = doc.querySelectorAll("td.zentriert");
const Positions = doc.querySelectorAll("td.zentriert.rueckennummer.bg_Torwart, td.zentriert.rueckennummer.bg_Abwehr, td.zentriert.rueckennummer.bg_Mittelfeld, td.zentriert.rueckennummer.bg_Sturm");
const Nationality = doc.querySelectorAll("td.zentriert");
const Values = doc.querySelectorAll("td.rechts.hauptlink");

for (let i = 0; i < Players.length; i++) {
	const playerAltText = Players[i].getAttribute("alt");
	if (playerAltText) {
		PlayersList.push(playerAltText);
	}
}

for (let i = 1; i < (Players.length * 3); i += 3) {
	const ageText = Age[i].textContent?.match(/\((.*?)\)/)?.[1];
	if (ageText) {
		AgeList.push(ageText);
	}
}

for (let i = 0; i < Positions.length; i++) {
	const positionTitle = Positions[i].getAttribute("title");
	if (positionTitle) {
		PositionsList.push(positionTitle);
	}
}

for (let i = 2; i < (Players.length * 3); i += 3) {
	const nationTitle = Nationality[i].querySelector('img')?.getAttribute("title");
	if (nationTitle) {
		NationList.push(nationTitle);
	}
}

for (let i = 0; i < Values.length; i++) {
	const valueText = Values[i].textContent?.trim();
	if (valueText) {
		ValuesList.push(valueText);
	}
}

// Prepare data for CSV export
const csvData = [];
for (let i = 0; i < PlayersList.length; i++) {
	csvData.push({
		Player: PlayersList[i],
		Age: AgeList[i],
		Position: PositionsList[i],
		Nation: NationList[i],
		Value: ValuesList[i],
	});
}

// Save to CSV
const filePath = "./players_data.csv";
await writeCSV(Deno.openSync(filePath, { write: true, create: true }), csvData);

console.log("CSV file created successfully at:", filePath);
