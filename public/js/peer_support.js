document.addEventListener('DOMContentLoaded', async function() {
    var user = {}; // The current user
    let token = localStorage.getItem("token") || sessionStorage.getItem("token"); // Get token from local storage

    // Check if token is null before proceeding
    if (!token) {
        alert("Your session has expired or you are not logged in. Please log in again.");
        window.location.href = "logineng.html"; // Redirect to login page
        return; // Stop execution
    }

    // Get the user data
    async function getUserData() {
        console.log('Token:', token);  // Log the token to ensure it's valid
        try {
            const response = await fetch(`/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('Error response:', errorData);  // Log error details
                throw new Error(errorData.message);
            }

            const userData = await response.json();
            console.log('User Data:', userData);  // Log the user data

            // Populate user object
            user = userData;
            // Display the user's name
            document.getElementById("user-name").innerText = user.name.toUpperCase();

            let user_id = user.user_id;
            console.log(user_id);
            await fetchAndPlotData(user_id);
        } catch (error) {
            console.log('Error in getUserData:', error.message);
            // Step 2: Handle invalid or expired token
            if (error.message === 'Forbidden: Invalid or expired token') {
                alert("Times out. Please login again!");
                localStorage.setItem("token", null); // Properly remove token from local storage
                sessionStorage.removeItem("token"); // Remove token from session storage
                window.location.href = "logineng.html"; // Redirect to login
            } else if (error.message === 'Unauthorized') {
                alert("Please login first!");
                window.location.href = "logineng.html"; // Redirect to login
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }

    // Log Out Button functionality
    document.getElementById("logout-btn").addEventListener("click", function() {
        // Step 3: Clear token on logout
        localStorage.removeItem("token");
        window.location.href = "logineng.html";
        history.replaceState(null, null, "logineng.html");
    });

    await getUserData();
});

async function fetchPosts() {
    try {
        // Make the fetch request to the server (replace with your backend URL)
        const response = await fetch('http://localhost:3000/posts');
        const posts = await response.json();

        // Get the container where posts will be added
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = ''; // Clear any previous content

        // Loop through the posts and create HTML for each one
        posts.forEach(post => {
            // Create a new div for each post
            const postElement = document.createElement('div');
            postElement.classList.add('post');

            // Format the created_at timestamp
            const createdAt = new Date(post.created_at);
            const formattedDate = createdAt.toLocaleString();

            // Set the HTML content for the post
            postElement.innerHTML = `
                <h3>${post.username}</h3>
                <p><strong>Posted on:</strong> ${formattedDate}</p>
                <h4>${post.content}</h4>
            `;

            // Append the new post to the posts container
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Call fetchPosts when the page loads
window.onload = fetchPosts;
  
