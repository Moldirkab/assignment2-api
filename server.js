import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/api/random-user", async (req, res) => {
  let extractedUser = {};
  let extractedCountry = {};
  let newsArticles = [];

  // ---  Random User ---
  try {
    const randomUserResp = await axios.get("https://randomuser.me/api/");
    const user = randomUserResp.data.results[0];

    extractedUser = {
      firstName: user?.name?.first || "John",
      lastName: user?.name?.last || "Doe",
      gender: user?.gender || "N/A",
      age: user?.dob?.age || 30,
      dob: user?.dob?.date || "1990-01-01T00:00:00.000Z",
      picture: user?.picture?.large || "https://randomuser.me/api/portraits/lego/1.jpg",
      city: user?.location?.city || "Unknown",
      country: user?.location?.country || "USA",
      address: user?.location?.street
        ? `${user.location.street.name} ${user.location.street.number}`
        : "123 Main St"
    };
  } catch (error) {
    console.error("RandomUser API failed:", error.message);
    extractedUser = {
      firstName: "John",
      lastName: "Doe",
      gender: "male",
      age: 30,
      dob: "1993-01-01T00:00:00.000Z",
      picture: "https://randomuser.me/api/portraits/lego/1.jpg",
      city: "New York",
      country: "USA",
      address: "5th Avenue 101"
    };
  }

  // --- Country info ---
  try {
    const countryApiKey = process.env.COUNTRYLAYER_API_KEY;
    const countryResp = await axios.get(
      `https://api.countrylayer.com/v2/name/${encodeURIComponent(extractedUser.country)}?access_key=${countryApiKey}`
    );

    const countryData = countryResp.data[0];

    extractedCountry = {
      name: countryData?.name || extractedUser.country,
      capital: countryData?.capital || "N/A",
      languages: countryData?.languages?.map(l => l.name).join(", ") || "N/A",
      currency: countryData?.currencies?.map(c => `${c.name} (${c.code})`).join(", ") || "N/A",
      flag: countryData?.flag || ""
    };
  } catch (error) {
    console.error("Countrylayer API failed:", error.message);
    extractedCountry = {
      name: extractedUser.country,
      capital: "Unknown",
      languages: "English",
      currency: "USD",
      flag: ""
    };
  }

  // --- Exchange Rates ---
let exchangeRates = {};
try {
  // Use currency from extractedCountry if available, otherwise default to EUR
  let currencyCode = "EUR";
  if (extractedCountry.currency) {
    const match = extractedCountry.currency.match(/\((.*?)\)/);
    if (match && match[1]) {
      currencyCode = match[1];
    }
  }

  const exchangeApiKey = process.env.EXCHANGERATE_API_KEY;

  const exchangeResp = await axios.get(
    `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/${currencyCode}`
  );

  const rates = exchangeResp.data.conversion_rates;

  exchangeRates = {
    base: currencyCode,
    USD: rates["USD"] ? rates["USD"].toFixed(2) : "N/A",
    KZT: rates["KZT"] ? rates["KZT"].toFixed(2) : "N/A"
  };
} catch (error) {
  console.error("ExchangeRate API failed:", error.message);
  exchangeRates = {
    base: "EUR",
    USD: "1.08",
    KZT: "495.20"
  };
}



  // --- NewsAPI ---
  try {
    const newsApiKey = process.env.NEWSAPI_KEY;
    const newsResp = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(extractedUser.country)}&language=en&pageSize=5&apiKey=${newsApiKey}`
    );

    newsArticles = newsResp.data.articles.map(article => ({
      title: article.title || "No title",
      description: article.description || "No description",
      url: article.url,
      image: article.urlToImage || ""
    }));
  } catch (error) {
    console.error("NewsAPI failed:", error.message);
    newsArticles = []; 
  }

  // --- Send combined JSON ---
  res.json({
    user: extractedUser,
    country: extractedCountry,
    news: newsArticles
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
