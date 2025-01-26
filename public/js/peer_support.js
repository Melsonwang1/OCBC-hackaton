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

document.getElementById('postForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get the form data
    const username = document.getElementById('username').value;
    const postContent = document.getElementById('postContent').value;

    // Prepare the data to send to the server
    const postData = {
        username: username,
        content: postContent
    };

    try {
        // Send a POST request to the server to insert the data into the database
        const response = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            alert('Post submitted successfully!');
            fetchPostsAndReplies(); // Refresh the posts list
            document.getElementById('postForm').reset();
        } else {
            alert('Failed to submit the post.');
        }
    } catch (error) {
        console.error('Error submitting post:', error);
    }
});

async function fetchPostsAndReplies() {
    try {
        // Fetch all posts from the backend
        const response = await fetch("http://localhost:3000/posts");
        const posts = await response.json();

        const postsContainer = document.getElementById("postsContainer");
        postsContainer.innerHTML = ""; // Clear existing content

        const style = document.createElement("style");
        style.innerHTML = `
            .replyForm input, .replyForm textarea {
                width: 100%;
                padding: 10px;
                margin: 8px 0 16px 0;
                border-radius: 5px;
                border: 1px solid #ccc;
                font-size: 16px;
                box-sizing: border-box;
            }

            .replyForm button {
                padding: 10px 15px;
                background-color: #007BFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            .replyForm button:hover {
                background-color: #0056b3;
            }
        `;
        document.head.appendChild(style);

        for (const post of posts) {
            // Create a post container
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            const createdAt = new Date(post.created_at);
            const formattedDate = createdAt.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'UTC' // Ensure the time stays in UTC
            });

            // Add post details
            postElement.innerHTML = `
                <h3>${post.username}</h3>
                <p><strong>Posted on:</strong> ${formattedDate}</p>
                <p>${post.content}</p>
                <br>
                <div class="replies" id="repliesForPost${post.post_id}">
                    <h4>Replies:</h4>
                </div>

                <form class="replyForm" data-post-id="${post.post_id}">
                    <input type="text" name="username" placeholder="Your Name" required />
                    <br>
                    <textarea name="content" rows="5" placeholder="Write a reply..." required></textarea>
                    <button type="submit">Reply</button>
                </form>
            `;

            postsContainer.appendChild(postElement);

            // Fetch and display replies for this post
            fetchReplies(post.post_id);
        }

        // Add event listeners to all reply forms
        document.querySelectorAll(".replyForm").forEach((form) => {
            form.addEventListener("submit", submitReply);
        });
    } catch (error) {
        console.error("Error fetching posts and replies:", error);
    }
}

async function fetchReplies(post_id) {
    try {
        // Fetch replies for a specific post from the backend
        const response = await fetch(`http://localhost:3000/posts/${post_id}/replies`);
        const replies = await response.json();

        const repliesContainer = document.getElementById(`repliesForPost${post_id}`);
        repliesContainer.innerHTML = "<h4>Replies:</h4>"; // Clear existing replies

        if (replies.length > 0) {
            replies.forEach((reply) => {
                const replyElement = document.createElement("div");
                const createdAt = new Date(reply.created_at);
                const formattedDate = createdAt.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                    timeZone: 'UTC' // Ensure the time stays in UTC
                });
                replyElement.classList.add("reply");
                replyElement.innerHTML = `
                    <p><strong>${reply.username}:</strong> ${reply.content}</p>
                    <small>Posted on: ${formattedDate}</small>
                `;
                repliesContainer.appendChild(replyElement);
            });
        } else {
            repliesContainer.innerHTML += "<p>No replies yet.</p>";
        }
    } catch (error) {
        console.error(`Error fetching replies for post ${post_id}:`, error);
    }
}

async function submitReply(event) {
    event.preventDefault();

    const form = event.target;
    const post_id = form.getAttribute("data-post-id");
    const username = form.username.value;
    const content = form.content.value;

    try {
        // Send reply to the backend
        const response = await fetch("http://localhost:3000/replies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id, username, content }),
        });

        if (response.ok) {
            // Refresh replies for the post
            fetchReplies(post_id);
            form.reset(); // Clear the form
        } else {
            console.error("Failed to submit reply:", await response.text());
        }
    } catch (error) {
        console.error("Error submitting reply:", error);
    }
}

// Load posts and replies on page load
window.onload = fetchPostsAndReplies;
  
function toggleMode() {
    const body = document.body;
    const button = document.getElementById('mode-toggle');

    // Toggle the 'dark-mode' class
    body.classList.toggle('dark-mode');
    
    // Update the button text
    if (body.classList.contains('dark-mode')) {
        button.textContent = 'Switch to Light Mode';
        localStorage.setItem('mode', 'dark');
    } else {
        button.textContent = 'Switch to Dark Mode';
        localStorage.setItem('mode', 'light');
    }
}

// Check the saved mode preference on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('mode') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('mode-toggle').textContent = 'Switch to Light Mode';
        document.getElementById('account-selection').classList.add('dark-mode');  // Apply dark mode to account selection
    }
});