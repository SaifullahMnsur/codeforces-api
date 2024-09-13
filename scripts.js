document.addEventListener("DOMContentLoaded", function () {
  const handles = ["SaifullahMnsur", "Rafi", "tourist"]; // Replace with actual user handles

  const fetchUserData = async () => {
    try {
      const handlesString = handles.join(";");
      const response = await fetch(
        `https://codeforces.com/api/user.info?handles=${handlesString}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const users = data.result;

        // Fetch all user statuses in parallel
        await Promise.all(
          handles.map((handle) => getUserStatus(handle, users))
        );
      } else {
        console.error("Error fetching data:", data.comment);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Async function to fetch a single user's status and update the table
  const getUserStatus = async (handle, users) => {
    const response = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const solvedProblems = new Set();

      data.result.forEach((submission) => {
        if (submission.verdict === "OK") {
          solvedProblems.add(
            `${submission.problem.contestId}-${submission.problem.index}`
          );
        }
      });
      console.log(solvedProblems.size)

      // Find the user and update their solvedCount
      const user = users.find((user) => user.handle === handle);
      if (user) {
        user.solvedCount = solvedProblems.size;
        updateTableRow(user);
      }
    } else {
      console.error(`Error fetching status for ${handle}:`, data.comment);
    }
  };

  // Function to update the table with a single user's data
  const updateTableRow = (user) => {
    const tableBody = document.querySelector("#userTable tbody");

    // Check if the row already exists
    let row = Array.from(tableBody.querySelectorAll("tr")).find((row) =>
      row.querySelector("td").textContent.includes(user.handle)
    );

    if (!row) {
      row = document.createElement("tr");
      row.classList.add("fade-in"); // Add animation class
      tableBody.appendChild(row);
    }

    row.innerHTML = `
      <td>${user.firstName || "N/A"} ${user.lastName || ""}</td>
      <td>${user.handle}</td>
      <td>${user.maxRating || "N/A"}</td>
      <td>${user.rating || "N/A"}</td>
      <td>${user.solvedCount || "N/A"}</td>
    `;
  };

  fetchUserData();
});

