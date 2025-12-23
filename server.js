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
  let exchangeRates = {};
  let newsArticles = [];

  // --- Random User ---
  try {
    const randomUserResp = await axios.get("https://randomuser.me/api/");
    const user = randomUserResp.data.results[0];

    extractedUser = {
      firstName: user?.name?.first || "No info available",
      lastName: user?.name?.last || "No info available",
      gender: user?.gender || "No info available",
      age: user?.dob?.age ?? "No info available",
      dob: user?.dob?.date || "No info available",
      picture: user?.picture?.large || "",
      city: user?.location?.city || "No info available",
      country: user?.location?.country || "No info available",
      address: user?.location?.street
        ? `${user.location.street.name} ${user.location.street.number}`
        : "No info available"
    };
  } catch (error) {
    console.error("RandomUser API failed:", error.message);
    extractedUser = {
      firstName: "No info available",
      lastName: "No info available",
      gender: "No info available",
      age: "No info available",
      dob: "No info available",
      picture: "",
      city: "No info available",
      country: "No info available",
      address: "No info available"
    };
  }

  // --- Country info ---
  if (extractedUser.country && extractedUser.country !== "No info available") {
    try {
      const countryApiKey = process.env.COUNTRYLAYER_API_KEY;
      const countryResp = await axios.get(
        `https://api.countrylayer.com/v2/name/${encodeURIComponent(extractedUser.country)}?access_key=${countryApiKey}`
      );

      const countryData = countryResp.data[0];

      extractedCountry = {
        name: countryData?.name || "No info available",
        capital: countryData?.capital || "No info available",
        languages: countryData?.languages?.map(l => l.name).join(", ") || "No info available",
        currency: countryData?.currencies?.map(c => `${c.name} (${c.code})`).join(", ") || "No info available",
        flag: countryData?.flag || ""
      };
    } catch (error) {
      console.error("Countrylayer API failed:", error.message);
      extractedCountry = {
        name: extractedUser.country,
        capital: "No info available",
        languages: "No info available",
        currency: "No info available",
        flag: ""
      };
    }
  } else {
    extractedCountry = {
      name: "No info available",
      capital: "No info available",
      languages: "No info available",
      currency: "No info available",
      flag: ""
    };
  }

  // --- Exchange Rates ---
  try {
    let currencyCode;

    if (extractedCountry?.currency && extractedCountry.currency !== "No info available") {
      const match = extractedCountry.currency.match(/\((.*?)\)/);
      if (match?.[1]) {
        currencyCode = match[1];
      }
    }

    if (!currencyCode) {
      exchangeRates = {
        base: "No info available",
        USD: "No info available",
        KZT: "No info available"
      };
    } else {
      const exchangeApiKey = process.env.EXCHANGERATE_API_KEY;
      const exchangeResp = await axios.get(
        `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/${currencyCode}`
      );

      const rates = exchangeResp.data.conversion_rates;

      exchangeRates = {
        base: currencyCode,
        USD: rates?.USD?.toFixed(2) || "No info available",
        KZT: rates?.KZT?.toFixed(2) || "No info available"
      };
    }
  } catch (error) {
    console.error("ExchangeRate API failed:", error.message);
    exchangeRates = {
      base: "No info available",
      USD: "No info available",
      KZT: "No info available"
    };
  }

  // --- NewsAPI ---
  try {
    const newsApiKey = process.env.NEWSAPI_KEY;
    const newsResp = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(extractedUser.country)}&language=en&pageSize=8&apiKey=${newsApiKey}`
    );
    newsArticles = newsResp.data.articles.map(article => ({
      title: article.title || "No title",
      description: article.description || "No description",
      url: article.url || "#",
      image: article.urlToImage || ""
    }));

    newsArticles = newsArticles.slice(0, 5);
  } catch (error) {
    console.error("NewsAPI failed:", error.message);
    newsArticles = [];
  }

  if (!newsArticles.length) {
    newsArticles = [{ title: "No news available", description: "", url: "", image: "" }];
  }

  res.json({
    user: extractedUser,
    country: extractedCountry,
    exchangeRates,
    news: newsArticles
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
