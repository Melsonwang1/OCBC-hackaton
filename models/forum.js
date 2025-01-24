const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Forum {
    constructor(post_id, username, content, created_at) {
        this.post_id = post_id;
        this.username = username;
        this.content = content;
        this.created_at = created_at;
    }

    // Get all forum posts
    static async getAllPosts() {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Posts ORDER BY created_at DESC`;
            const result = await connection.request().query(sqlQuery);

            return result.recordset.map(
                (row) => new Forum(
                    row.post_id,
                    row.username,
                    row.content,
                    row.created_at
                )
            );
        } catch (error) {
            console.error("Error fetching all posts:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // Add a new post
    static async createPost(username, content) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Posts (username, content) 
                VALUES (@username, @content)
            `;
            const request = connection.request();
            request.input('username', sql.VarChar, username);
            request.input('content', sql.Text, content);

            await request.query(sqlQuery);
        } catch (error) {
            console.error("Error creating new post:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = Forum; // Export ForumPost Class
