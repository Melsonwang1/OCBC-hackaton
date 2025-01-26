const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Reply {
    constructor(reply_id, post_id, username, content, created_at) {
        this.reply_id = reply_id;
        this.post_id = post_id;
        this.username = username;
        this.content = content;
        this.created_at = created_at;
    }

    // Get all replies for a specific post
    static async getRepliesByPostId(post_id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT * FROM Replies 
                WHERE post_id = @post_id 
                ORDER BY created_at ASC
            `;
            const request = connection.request();
            request.input("post_id", sql.Int, post_id);

            const result = await request.query(sqlQuery);

            return result.recordset.map(
                (row) =>
                    new Reply(
                        row.reply_id,
                        row.post_id,
                        row.username,
                        row.content,
                        row.created_at
                    )
            );
        } catch (error) {
            console.error("Error fetching replies:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // Add a new reply
    static async createReply(post_id, username, content) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Replies (post_id, username, content) 
                VALUES (@post_id, @username, @content)
            `;
            const request = connection.request();
            request.input("post_id", sql.Int, post_id);
            request.input("username", sql.VarChar, username);
            request.input("content", sql.Text, content);

            await request.query(sqlQuery);
        } catch (error) {
            console.error("Error creating reply:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = Reply;
