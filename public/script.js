document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("loadUserBtn");
  const container = document.getElementById("userContainer");

  button.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/random-user");
      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      const { user, country, news, exchangeRates } = data;

      // safe access with optional chaining
      const usdRate = exchangeRates?.USD || "N/A";
      const kztRate = exchangeRates?.KZT || "N/A";
      const currencyCode = country.currency?.split("(")[1]?.replace(")", "") || "N/A";

      container.innerHTML = `
        <div class="card">
          <img src="${user.picture || '/default.png'}" alt="Profile Picture">
          <h2>${user.firstName} ${user.lastName}</h2>
          <p><strong>Gender:</strong> ${user.gender}</p>
          <p><strong>Age:</strong> ${user.age}</p>
          <p><strong>Date of Birth:</strong> ${new Date(user.dob).toDateString()}</p>
          <p><strong>City:</strong> ${user.city}</p>
          <p><strong>Country:</strong> ${user.country}</p>
          <p><strong>Address:</strong> ${user.address}</p>

          <hr>
          <h3>Exchange Rates</h3>
          <p>1 ${currencyCode} = ${usdRate} USD</p>
          <p>1 ${currencyCode} = ${kztRate} KZT</p>

          <hr>
          <h3>Top News Headlines in ${user.country}</h3>
          ${news.length ? news.map(n => `
            <div class="news-card">
              <h4>${n.title}</h4>
              ${n.image ? `<img src="${n.image}" alt="News Image" width="150">` : ""}
              <p>${n.description}</p>
              <a href="${n.url}" target="_blank">Read more</a>
            </div>
          `).join("") : "<p>No news available.</p>"}
        </div>
      `;

    } catch (error) {
      console.error(error);
      container.innerHTML = "<p>Error loading user, country, news, or exchange info</p>";
    }
  });
});
