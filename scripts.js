document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch handles from a JSON file
  const fetchHandles = async () => {
    try {
      const response = await fetch("handles.json");
      const data = await response.json();
      return data.handles; // Return the handles array
    } catch (error) {
      console.error("Error fetching handles:", error);
      return [];
    }
  };

  // Function to pause execution for a specified duration (ms)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Function to update progress bar
  const updateProgressBar = (current, total) => {
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const progressContainer = document.getElementById("progressContainer");

    // Calculate percentage progress
    const percentage = Math.round((current / total) * 100);

    // Update progress bar and text
    progressBar.value = percentage;
    progressText.textContent = `${percentage}%`;

    // Show the progress container until the progress is complete
    if (percentage < 100) {
      progressContainer.style.display = "block";
    } else {
      progressContainer.style.display = "none"; // Hide when completed
    }
  };

  const fetchUserData = async () => {
    try {
      const handles = await fetchHandles();
      if (handles.length === 0) {
        console.error("No handles found.");
        return;
      }

      // Initialize progress bar
      updateProgressBar(0, handles.length);

      // Fetch user info one by one to avoid hitting the API rate limit
      for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];
        await getUserInfo(handle);
        await sleep(1000); // Pause for 1 second between each request
        updateProgressBar(i + 1, handles.length); // Update progress bar
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Async function to fetch a single user's info and update the table
  const getUserInfo = async (handle) => {
    try {
      let retry = true;

      while (retry) {
        const response = await fetch(
          `https://codeforces.com/api/user.info?handles=${handle}`
        );
        const data = await response.json();

        if (data.status === "OK") {
          retry = false; // Successfully fetched, no retry needed
          const user = data.result[0]; // User info is in result array

          // Fetch user's status (solved problems) after getting their info
          await getUserStatus(handle, user);
        } else if (data.comment === "Call limit exceeded") {
          console.warn(
            `Call limit exceeded for ${handle}. Pausing for 1 second...`
          );
          await sleep(1000); // Pause for 1 second before retrying
        } else {
          console.error(
            `Error fetching user info for ${handle}:`,
            data.comment
          );
          retry = false; // Stop retrying on other types of errors
        }
      }
    } catch (error) {
      console.error(`Error fetching user info for ${handle}:`, error);
    }
  };

  // Async function to fetch a single user's status and update the table
  const getUserStatus = async (handle, user) => {
    try {
      let retry = true;

      while (retry) {
        const response = await fetch(
          `https://codeforces.com/api/user.status?handle=${handle}`
        );
        const data = await response.json();

        if (data.status === "OK") {
          retry = false; // Successfully fetched, no retry needed
          const solvedProblems = new Set();

          data.result.forEach((submission) => {
            if (submission.verdict === "OK") {
              solvedProblems.add(
                `${submission.problem.contestId}-${submission.problem.index}`
              );
            }
          });
          console.log(solvedProblems.size);

          // Update user's solvedCount
          user.solvedCount = solvedProblems.size;
          updateTableRow(user);
        } else if (data.comment === "Call limit exceeded") {
          console.warn(
            `Call limit exceeded for ${handle}. Pausing for 1 second...`
          );
          await sleep(1000); // Pause for 1 second before retrying
        } else {
          console.error(`Error fetching status for ${handle}:`, data.comment);
          retry = false; // Stop retrying on other types of errors
        }
      }
    } catch (error) {
      console.error(`Error fetching user status for ${handle}:`, error);
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
