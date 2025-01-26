const Reply = require("../models/reply");

// Get all replies for a specific post
const getRepliesByPostId = async (req, res) => {
    const { post_id } = req.params;

    try {
        const replies = await Reply.getRepliesByPostId(post_id);

        if (!replies || replies.length === 0) {
            return res.status(404).send("No replies found for this post.");
        }

        res.status(200).json(replies);
    } catch (error) {
        console.error("Error fetching replies:", error);
        res.status(500).send("An error occurred while retrieving replies.");
    }
};

// Create a new reply
const createReply = async (req, res) => {
    const { post_id, username, content } = req.body;

    // Validate input
    if (!post_id || !username || !content) {
        return res.status(400).send("Post ID, username, and content are required.");
    }

    try {
        await Reply.createReply(post_id, username, content);
        res.status(201).send("Reply created successfully.");
    } catch (error) {
        console.error("Error creating reply:", error);
        res.status(500).send("An error occurred while creating the reply.");
    }
};

module.exports = {
    getRepliesByPostId,
    createReply,
};