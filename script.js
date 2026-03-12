const button = document.querySelector('button');
const input = document.querySelector('input');
const results = document.getElementById('results');

const snacks = [
    {name: 'Takis Fuego', store: 'Circle K - 0.4 miles away' },
    {name: 'Doritos Nacho Cheese', store: 'Walmart - 1.2 miles away'},
    {name: 'Hi-Chew Original', store: 'Target - 1.8 miles away'},
    {name: 'Flamin Hot Cheetos', store: 'Walgreens - 0.7 miles away'},
    {name: 'Takis Blue Heat', store: '7-Eleven - 0.9 miles away'},
]

button.addEventListener('click', function() {
    const searchTerm = input.value.toLowerCase();
    results.innerHTML = ''

    if (searchTerm === ''){
        results.innerHTML = '<p>Please type a snack name first.</p>';
        return
    } 

    const mathces = snacks.filter(function(snack) {
        return snack.name.toLowerCase().includes(searchTerm)
    })

    if (mathces.length === 0) {
        results.innerHTML = '<p>No snacks found. Try another Search.</p>'
    } else {
        mathces.forEach(function(snack) {
            results.innerHTML += `
                <div class="result-card">
                    <div class="result-name">${snack.name}</div>
                    <div class="result-store"> ${snack.store}</div>
                </div>
            `
        })
    }
})
