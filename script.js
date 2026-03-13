const SUPABASE_URL = "https://laqwgudyogubqkyihxdw.supabase.co";
const SUPABASE_KEY = "sb_publishable_bITSd7RbMdfwaknDXV-x7A_yEInJl60";

const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");
const resultsDiv = document.getElementById("results");

async function searchSnacks(query) {
  resultsDiv.innerHTML = "<p style='color:#7a6f65;'>Searching...</p>";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Snacks?or=(name.ilike.*${query}*,brand.ilike.*${query}*,category.ilike.*${query}*)&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const snacks = await response.json();
    console.log("Response:", snacks);

    if (!Array.isArray(snacks) || snacks.length === 0) {
      resultsDiv.innerHTML = "<p style='color:#7a6f65;'>No snacks found. Try another search!</p>";
      return;
    }

    resultsDiv.innerHTML = snacks
      .map(
        (snack) => `
        <div class="result-card">
          <div class="result-name">${snack.name}</div>
          <div class="result-store">${snack.brand}</div>
          <div class="result-store">${snack.category}</div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Error:", err);
    resultsDiv.innerHTML = "<p style='color:red;'>Something went wrong. Check the console.</p>";
  }
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchSnacks(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) searchSnacks(query);
  }
});