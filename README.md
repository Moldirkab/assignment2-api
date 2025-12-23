# Random User & Country Info Dashboard

A Node.js application that fetches random user data, country information, exchange rates, and news articles to display in a visually organized dashboard. Built with **Express** and **Axios** for API integration.

---

## Table of Contents

- [Features](#features)  
- [Prerequisites](#prerequisites)  
- [Setup](#setup)  
- [Environment Variables](#environment-variables)   
- [Design Decisions](#design-decisions)  

---

## Features

- Fetch random user details using **RandomUser API**  
- Retrieve country information (capital, languages, currency, flag) via **CountryLayer API**  
- Fetch exchange rates (USD & KZT) using **ExchangeRate API**  
- Display the latest news for the user’s country using **NewsAPI**  
- Handles missing or invalid data gracefully with fallback messages  
- Responsive frontend design with clean, colored cards for user, currency, and news  

---

## Prerequisites

- Node.js v18+  
- npm (Node Package Manager)  
- API keys for:
  - [CountryLayer](https://countrylayer.com/)  
  - [ExchangeRate API](https://www.exchangerate-api.com/)  
  - [NewsAPI](https://newsapi.org/)  

---

## Setup

1. Clone the repository:

```bash
git clone https://github.com/YourUsername/RandomUserDashboard.git
cd RandomUserDashboard
npm install
```

## Environment Variables

Create a `.env` file in the root directory and add your API keys:

```env
COUNTRYLAYER_API_KEY=your_countrylayer_key
EXCHANGERATE_API_KEY=your_exchangerate_key
NEWSAPI_KEY=your_newsapi_key
```

## Design Decisions

### API Integration Logic
- Each external API request is wrapped in a `try/catch` block.
- Missing data is handled gracefully with `"No info available"` as a fallback.
- Exchange rates are fetched only if a valid currency is available.

### Frontend Design
- Grid layout is used for responsive cards.
- Fixed image sizes ensure uniformity across all cards.
- Colored cards use softer, non-neon tones for better readability.

### News Display Logic
- API requests fetch 7 articles but only render 5 to ensure valid entries.
- Missing or incomplete articles are filled with default placeholder content.

### Code Modularity
- Concerns are separated into structured functions and modules.
- Easy to extend, for example, to add more API sources or different card types.
