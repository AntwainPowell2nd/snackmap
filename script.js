const SUPABASE_URL = "https://laqwgudyogubqkyihxdw.supabase.co";
const SUPABASE_KEY = "sb_publishable_bITSd7RbMdfwaknDXV-x7A_yEInJl60";

const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");
const resultsDiv = document.getElementById("results");

async function searchSnacks(query) {
    resultsDiv.innerHTML = "<p style-'color:#7a6f65;'>Searching...</p>";

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/Snacks?or=(name.ilike.*${query}*,brandilike.*${query}*,category.ilike.*{query}*)&select=*`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,

            },
        }
    );

    const snack = await response.json();

    if(!snack.length) {
        resultsDiv.innerHTML = "<p style='color:#7a6f65;'>No snacks found. Try another search!</p>";
        return;
    }

    resultsDiv.innerHTML = searchSnacks
        .map(
            (snack) => `
            <div class="result-card">
                <div class="result-name">${snack.name}</div>
                <div class="result-store">${snack.brand}</div>
                <div class="result-store'>${snack.category}</div>
            </div>
        `
        )
        .join("");
}

searchButton.addEventListener("click", () => {
    const query = searchInput.vaule.trim();
    if (query) (searchSnacks(query));
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) searchSnacks(query);
    }
});

