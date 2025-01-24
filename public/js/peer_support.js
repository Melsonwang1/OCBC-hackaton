document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form values
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    // Create a new post element
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        <small>Posted just now</small>
    `;

    // Add the post to the posts container
    document.getElementById('postsContainer').appendChild(postElement);

    // Reset the form
    document.getElementById('postForm').reset();
});
