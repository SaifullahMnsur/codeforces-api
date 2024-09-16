document.addEventListener('DOMContentLoaded', () => {
    // Use a CORS proxy to bypass CORS issues
    const apiUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://cf-api-rzkk.onrender.com/cf-api');
    
    // Select DOM elements
    const userTableBody = document.querySelector('#userTable tbody');

    // Function to fetch data from the API
    async function fetchData() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            populateTable(JSON.parse(data.contents));
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // Function to populate the table with user data
    function populateTable(data) {
        let index = 0;
        const totalUsers = Object.keys(data).length;

        for (const handle in data) {
            const user = data[handle];
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${handle}</td>
                <td>${user.handle}</td>
                <td>${user.maxRating}</td>
                <td>${user.rating}</td>
                <td>${user.solvedProblem}</td>
            `;
            userTableBody.appendChild(row);
        }
    }

    // Fetch data when the page loads
    fetchData();
});
