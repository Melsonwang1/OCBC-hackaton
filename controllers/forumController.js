const ForumPost = require("../models/forum");

// Get all forum posts
const getAllPosts = async (req, res) => {
    try {
        // Fetch all posts from the ForumPost model
        const posts = await ForumPost.getAllPosts();

        if (!posts || posts.length === 0) {
            return res.status(404).send("No forum posts found.");
        }

        // Return the posts data as JSON
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching forum posts:", error);
        res.status(500).send("An error occurred while retrieving forum posts.");
    }
};

// Create a new forum post
const createPost = async (req, res) => {
    const { username, content } = req.body;

    // Validate request data
    if (!username || !content) {
        return res.status(400).send("Username and content are required.");
    }

    try {
        // Create a new post using the ForumPost model
        await ForumPost.createPost(username, content);

        // Respond with success message
        res.status(201).send("Post created successfully.");
    } catch (error) {
        console.error("Error creating forum post:", error);
        res.status(500).send("An error occurred while creating the post.");
    }
};

module.exports = {
    getAllPosts,
    createPost,
};
