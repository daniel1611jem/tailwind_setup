import { GoogleGenerativeAI } from "@google/generative-ai";

// US state area codes mapping
const STATE_AREA_CODES = {
  CA: [
    "213",
    "310",
    "323",
    "408",
    "415",
    "510",
    "562",
    "619",
    "626",
    "650",
    "657",
    "661",
    "669",
    "707",
    "714",
    "747",
    "760",
    "805",
    "818",
    "831",
    "858",
    "909",
    "916",
    "925",
    "949",
    "951",
  ],
  NY: [
    "212",
    "315",
    "347",
    "516",
    "518",
    "585",
    "607",
    "631",
    "646",
    "716",
    "718",
    "845",
    "914",
    "917",
    "929",
  ],
  TX: [
    "210",
    "214",
    "254",
    "281",
    "325",
    "346",
    "361",
    "409",
    "430",
    "432",
    "469",
    "512",
    "682",
    "713",
    "737",
    "806",
    "817",
    "830",
    "832",
    "903",
    "915",
    "936",
    "940",
    "956",
    "972",
    "979",
  ],
  FL: [
    "239",
    "305",
    "321",
    "352",
    "386",
    "407",
    "561",
    "727",
    "754",
    "772",
    "786",
    "813",
    "850",
    "863",
    "904",
    "941",
    "954",
  ],
  IL: [
    "217",
    "224",
    "309",
    "312",
    "331",
    "618",
    "630",
    "708",
    "773",
    "779",
    "815",
    "847",
    "872",
  ],
  PA: [
    "215",
    "267",
    "272",
    "412",
    "445",
    "484",
    "570",
    "610",
    "717",
    "724",
    "814",
    "878",
  ],
  OH: [
    "216",
    "220",
    "234",
    "283",
    "330",
    "380",
    "419",
    "440",
    "513",
    "567",
    "614",
    "740",
    "937",
  ],
  GA: ["229", "404", "470", "478", "678", "706", "762", "770", "912"],
  NC: ["252", "336", "704", "743", "828", "910", "919", "980", "984"],
  MI: [
    "231",
    "248",
    "269",
    "313",
    "517",
    "586",
    "616",
    "734",
    "810",
    "906",
    "947",
    "989",
  ],
  NJ: ["201", "551", "609", "732", "848", "856", "862", "908", "973"],
  VA: ["276", "434", "540", "571", "703", "757", "804"],
  WA: ["206", "253", "360", "425", "509", "564"],
  AZ: ["480", "520", "602", "623", "928"],
  MA: ["339", "351", "413", "508", "617", "774", "781", "857", "978"],
  TN: ["423", "615", "629", "731", "865", "901", "931"],
  IN: ["219", "260", "317", "463", "574", "765", "812", "930"],
  MO: ["314", "417", "573", "636", "660", "816"],
  MD: ["240", "301", "410", "443", "667"],
  WI: ["262", "414", "534", "608", "715", "920"],
  CO: ["303", "719", "720", "970"],
  MN: ["218", "320", "507", "612", "651", "763", "952"],
  SC: ["803", "843", "854", "864"],
  AL: ["205", "251", "256", "334", "659", "938"],
  LA: ["225", "318", "337", "504", "985"],
  KY: ["270", "364", "502", "606", "859"],
  OR: ["458", "503", "541", "971"],
  OK: ["405", "539", "580", "918"],
  CT: ["203", "475", "860", "959"],
  UT: ["385", "435", "801"],
  IA: ["319", "515", "563", "641", "712"],
  NV: ["702", "725", "775"],
  AR: ["479", "501", "870"],
  MS: ["228", "601", "662", "769"],
  KS: ["316", "620", "785", "913"],
  NM: ["505", "575"],
  NE: ["308", "402", "531"],
  ID: ["208", "986"],
  WV: ["304", "681"],
  HI: ["808"],
  NH: ["603"],
  ME: ["207"],
  RI: ["401"],
  MT: ["406"],
  DE: ["302"],
  SD: ["605"],
  ND: ["701"],
  AK: ["907"],
  VT: ["802"],
  WY: ["307"],
};

// US city coordinates database
const CITY_COORDINATES = {
  // California
  "Los Angeles": { lat: 34.0522, lng: -118.2437, state: "CA", zip: "90001" },
  "San Diego": { lat: 32.7157, lng: -117.1611, state: "CA", zip: "92101" },
  "San Francisco": { lat: 37.7749, lng: -122.4194, state: "CA", zip: "94102" },
  "San Jose": { lat: 37.3382, lng: -121.8863, state: "CA", zip: "95101" },
  Sacramento: { lat: 38.5816, lng: -121.4944, state: "CA", zip: "95814" },
  Fresno: { lat: 36.7378, lng: -119.7871, state: "CA", zip: "93650" },
  Oakland: { lat: 37.8044, lng: -122.2712, state: "CA", zip: "94601" },

  // New York
  "New York": { lat: 40.7128, lng: -74.006, state: "NY", zip: "10001" },
  Buffalo: { lat: 42.8864, lng: -78.8784, state: "NY", zip: "14201" },
  Rochester: { lat: 43.1566, lng: -77.6088, state: "NY", zip: "14602" },
  Albany: { lat: 42.6526, lng: -73.7562, state: "NY", zip: "12201" },

  // Texas
  Houston: { lat: 29.7604, lng: -95.3698, state: "TX", zip: "77001" },
  Dallas: { lat: 32.7767, lng: -96.797, state: "TX", zip: "75201" },
  Austin: { lat: 30.2672, lng: -97.7431, state: "TX", zip: "73301" },
  "San Antonio": { lat: 29.4241, lng: -98.4936, state: "TX", zip: "78201" },
  "Fort Worth": { lat: 32.7555, lng: -97.3308, state: "TX", zip: "76101" },
  "El Paso": { lat: 31.7619, lng: -106.485, state: "TX", zip: "79901" },

  // Florida
  Miami: { lat: 25.7617, lng: -80.1918, state: "FL", zip: "33101" },
  Orlando: { lat: 28.5383, lng: -81.3792, state: "FL", zip: "32801" },
  Tampa: { lat: 27.9506, lng: -82.4572, state: "FL", zip: "33601" },
  Jacksonville: { lat: 30.3322, lng: -81.6557, state: "FL", zip: "32099" },

  // Illinois
  Chicago: { lat: 41.8781, lng: -87.6298, state: "IL", zip: "60601" },

  // Pennsylvania
  Philadelphia: { lat: 39.9526, lng: -75.1652, state: "PA", zip: "19019" },
  Pittsburgh: { lat: 40.4406, lng: -79.9959, state: "PA", zip: "15201" },

  // Arizona
  Phoenix: { lat: 33.4484, lng: -112.074, state: "AZ", zip: "85001" },
  Tucson: { lat: 32.2226, lng: -110.9747, state: "AZ", zip: "85701" },

  // Washington
  Seattle: { lat: 47.6062, lng: -122.3321, state: "WA", zip: "98101" },
  Spokane: { lat: 47.6588, lng: -117.426, state: "WA", zip: "99201" },

  // Massachusetts
  Boston: { lat: 42.3601, lng: -71.0589, state: "MA", zip: "02101" },

  // Colorado
  Denver: { lat: 39.7392, lng: -104.9903, state: "CO", zip: "80201" },

  // Georgia
  Atlanta: { lat: 33.749, lng: -84.388, state: "GA", zip: "30301" },

  // Michigan
  Detroit: { lat: 42.3314, lng: -83.0458, state: "MI", zip: "48201" },

  // Nevada
  "Las Vegas": { lat: 36.1699, lng: -115.1398, state: "NV", zip: "89101" },
};

// Common user agents for Dolphin browser
const DOLPHIN_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
];

class AIService {
  constructor() {
    this.genAI = null;
  }

  initialize(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  getPhoneNumber(state) {
    const areaCodes = STATE_AREA_CODES[state] || STATE_AREA_CODES["CA"];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const prefix = Math.floor(Math.random() * (999 - 200) + 200);
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${prefix}-${lineNumber}`;
  }

  getUserAgent() {
    return DOLPHIN_USER_AGENTS[
      Math.floor(Math.random() * DOLPHIN_USER_AGENTS.length)
    ];
  }

  findClosestCity(proxyCity, proxyState) {
    // Try exact match first
    if (proxyCity && CITY_COORDINATES[proxyCity]) {
      return { city: proxyCity, ...CITY_COORDINATES[proxyCity] };
    }

    // Try to find by state
    if (proxyState) {
      const citiesInState = Object.entries(CITY_COORDINATES).filter(
        ([_, data]) => data.state === proxyState
      );
      if (citiesInState.length > 0) {
        const [city, data] =
          citiesInState[Math.floor(Math.random() * citiesInState.length)];
        return { city, ...data };
      }
    }

    // Default to Los Angeles
    return { city: "Los Angeles", ...CITY_COORDINATES["Los Angeles"] };
  }

  async generateProfile(proxyData, existingProfiles = []) {
    // Get location data first (needed for fallback)
    const locationData = this.findClosestCity(proxyData.city, proxyData.state);
    const phoneNumber = this.getPhoneNumber(locationData.state);
    const userAgent = this.getUserAgent();

    // Try AI generation, fallback to fake data if fails
    try {
      if (!this.genAI) {
        throw new Error(
          "AI Service not initialized. Please configure API key."
        );
      }

      console.log("🤖 AI Service generating profile for location:", proxyData);

      // Try gemini-pro first (most compatible with free tier)
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      // Build existing names list to avoid duplicates
      const existingNames = existingProfiles
        .map((p) => p.fullName)
        .filter(Boolean)
        .join(", ");

      const prompt = `Generate a realistic US student profile for someone living in ${
        locationData.city
      }, ${locationData.state}. 

Requirements:
- Must be a UNIQUE name (not in this list: ${existingNames || "none"})
- Age between 18-25 years old
- Generate a realistic full street address in ${locationData.city}, ${
        locationData.state
      } ${locationData.zip}
- Must be consistent with American naming and address conventions
- Create a professional Gmail address based on the name
- Gender should be male or female

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "fullName": "First Last",
  "age": 21,
  "gender": "male",
  "address": "123 Main Street Apt 4B",
  "email": "firstname.lastname@gmail.com"
}`;

      console.log("📤 Sending prompt to Gemini API...");
      console.log(
        "🔑 Using API key:",
        this.genAI ? "Initialized" : "NOT initialized"
      );

      const result = await model.generateContent(prompt);

      if (!result || !result.response) {
        throw new Error("Empty response from Gemini API");
      }

      const response = await result.response;
      const text = response.text().trim();

      console.log("📥 Gemini API response:", text.substring(0, 200));

      // Try to extract JSON from response
      let jsonText = text;
      if (text.includes("```json")) {
        jsonText = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonText = text.split("```")[1].split("```")[0].trim();
      }

      console.log("🔍 Extracted JSON:", jsonText);

      const aiData = JSON.parse(jsonText);

      // Combine AI data with location data
      const profileData = {
        fullName: aiData.fullName,
        age: aiData.age,
        gender: aiData.gender,
        address: aiData.address,
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zip,
        studentGmail: aiData.email,
        phoneNumber: phoneNumber,
        latitude: locationData.lat,
        longitude: locationData.lng,
        userAgent: userAgent,
      };

      console.log("✅ Profile generated successfully:", profileData);
      return profileData;
    } catch (error) {
      console.error("❌ AI Generation Error:", error);
      console.error("Error details:", error.message);

      // Fallback: Generate realistic fake data if AI fails
      console.log("⚠️ Using fallback data generation...");

      const firstNames = {
        male: [
          "James",
          "John",
          "Robert",
          "Michael",
          "William",
          "David",
          "Richard",
          "Joseph",
          "Thomas",
          "Christopher",
        ],
        female: [
          "Mary",
          "Patricia",
          "Jennifer",
          "Linda",
          "Elizabeth",
          "Barbara",
          "Susan",
          "Jessica",
          "Sarah",
          "Karen",
        ],
      };

      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
      ];

      const gender = Math.random() > 0.5 ? "male" : "female";
      const firstName =
        firstNames[gender][
          Math.floor(Math.random() * firstNames[gender].length)
        ];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const age = Math.floor(Math.random() * 8) + 18; // 18-25

      const streetNumber = Math.floor(Math.random() * 9000) + 1000;
      const streets = [
        "Main Street",
        "Oak Avenue",
        "Maple Drive",
        "Pine Street",
        "Elm Avenue",
        "Cedar Lane",
      ];
      const aptNumber = Math.floor(Math.random() * 50) + 1;
      const address = `${streetNumber} ${
        streets[Math.floor(Math.random() * streets.length)]
      } Apt ${aptNumber}`;

      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;

      const fallbackData = {
        fullName: fullName,
        age: age,
        gender: gender,
        address: address,
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zip,
        studentGmail: email,
        phoneNumber: phoneNumber,
        latitude: locationData.lat,
        longitude: locationData.lng,
        userAgent: userAgent,
      };

      console.log("✅ Fallback profile generated:", fallbackData);
      return fallbackData;
    }
  }
}

export const aiService = new AIService();
