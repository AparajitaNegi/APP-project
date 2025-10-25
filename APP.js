function updatePodium(drivers) {
    const top3 = drivers.slice(0, 3);

    top3.forEach(driverData => { // 'driverData' here is an item from the results array from server.py
        const podiumCard = document.getElementById(`podium-${driverData.position}`);
        if (podiumCard) {
            podiumCard.querySelector('.driver-name').textContent = driverData.driver;
            podiumCard.querySelector('.team-name').textContent = driverData.team;
        }
    });
}
async function fetchLeaderboard() {
    try {
        const response = await fetch('/leaderboard');
        const raceResults = await response.json(); // Data from our Flask backend (OpenF1 API)

        // Check if raceResults is empty, if so, display a message
        if (!raceResults || raceResults.length === 0) {
            const tbody = document.querySelector('#leaderboard-body');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="5">Could not load driver standings. Please check the server.</td></tr>`;
            }
            // Also clear podium if no data
            document.getElementById('podium-1').querySelector('.driver-name').textContent = '';
            document.getElementById('podium-2').querySelector('.driver-name').textContent = '';
            document.getElementById('podium-3').querySelector('.driver-name').textContent = '';
            return; // Exit the function if no data
        }

        updatePodium(raceResults); // Use the data from our Flask backend

        const tbody = document.querySelector('#leaderboard-body');
        tbody.innerHTML = '';

        raceResults.forEach(driverData => {
            const tr = document.createElement('tr');
            tr.classList.add('leaderboard-row');

            // Podium coloring
            const position = parseInt(driverData.position, 10);
            if (position === 1) tr.classList.add('podium-1');
            else if (position === 2) tr.classList.add('podium-2');
            else if (position === 3) tr.classList.add('podium-3');

            tr.innerHTML = `
                <td>${driverData.position}</td>
                <td>${driverData.driver}</td>
                <td>${driverData.team}</td>
                <td>${driverData.wins}</td>
                <td>${driverData.points}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        const tbody = document.querySelector('#leaderboard-body');
        tbody.innerHTML = `<tr><td colspan="5">Error fetching data. Please try again later.</td></tr>`;
    }
}

function displayTeams() {
    const teams = [
        { name: 'Mercedes', color: '#6CD3BF', engine: 'Mercedes', base: 'Brackley, UK', drivers: 'George Russell, Kimi Antonelli', logo: 'mercedes.png' },
        { name: 'Red Bull Racing', color: '#3671C6', engine: 'Honda RBPT', base: 'Milton Keynes, UK', drivers: 'Max Verstappen, Liam Lawson', logo: 'redbull.jpg' },
        { name: 'Ferrari', color: '#F91536', engine: 'Ferrari', base: 'Maranello, Italy', drivers: 'Charles Leclerc, Lewis Hamilton', logo: 'ferrari.png'},
        { name: 'McLaren', color: '#F58020', engine: 'Mercedes', base: 'Woking, UK', drivers: 'Lando Norris, Oscar Piastri', logo: 'mclaren.png' },
        { name: 'Aston Martin', color: '#358C75', engine: 'Mercedes', base: 'Silverstone, UK', drivers: 'Fernando Alonso, Lance Stroll', logo: 'aston_martin.png' },
        { name: 'Alpine', color: '#2293D1', engine: 'Renault', base: 'Enstone, UK', drivers: 'Pierre Gasly, Jack Doohan', logo: 'alpine.webp' },
        { name: 'Williams', color: '#37BEDD', engine: 'Mercedes', base: 'Grove, UK', drivers: 'Alex Albon, Carlos Sainz', logo: 'williams.png' },
        { name: 'RB', color: '#6692FF', engine: 'Honda RBPT', base: 'Faenza, Italy', drivers: 'Yuki Tsunoda, Isack Hadjar', logo: 'rb.jpeg' },
        { name: 'Kick Sauber', color: '#52E252', engine: 'Ferrari', base: 'Hinwil, Switzerland', drivers: 'Nico Hülkenberg, Gabriel Bortoleto', logo: 'kick_sauber.png' },
        { name: 'Haas', color: '#B6BABD', engine: 'Ferrari', base: 'Kannapolis, USA', drivers: 'Esteban Ocon, Oliver Bearman', logo: 'haas.jpg' }
    ];

    const grid = document.getElementById('teams-grid');
    if (!grid) return;
    grid.innerHTML = ''; 

    teams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.style.borderColor = team.color;

        card.innerHTML = `
            <div class="team-card-header" style="color: ${team.color};">
                ${team.logo ? `<img src="${team.logo}" alt="${team.name} Logo" class="team-logo">` : ''}
                <span class="team-name-text">${team.name}</span>
            </div>
            <div class="team-card-body">
                <div class="team-detail"><strong>Base:</strong> ${team.base}</div>
                <div class="team-detail"><strong>Engine:</strong> ${team.engine}</div>
                <div class="team-detail"><strong>Drivers:</strong> ${team.drivers}</div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function initialLoad() {
    // Update the main heading
    const heading = document.querySelector('h1');
    if (heading) {
        heading.textContent = 'F1 Leadership Board';
    }
    const tbody = document.querySelector('#leaderboard-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5">Loading driver standings...</td></tr>`;
    }
    // Fetch leaderboard data immediately on load
    fetchLeaderboard().catch(err => {
        console.error("Initial leaderboard fetch failed:", err);
    });
    displayTeams();
}
setInterval(fetchLeaderboard, 60000);

document.addEventListener('DOMContentLoaded', initialLoad);