var admin = "";

function redirectToCreatePost() {
    window.location.href = 'create_post.html';
}

document.addEventListener("DOMContentLoaded", function () {
    fetch('http://localhost:5500/get_pendings')
        .then(response => response.json())
        .then(data => {
            const pendingCount = data.pending_posts_count; // Adjust according to your API response
            if (pendingCount === 0) {
                document.getElementById('post_badge').style.display = "none";
            }
            console.log("pending count: " + pendingCount);
            document.getElementById('post_badge').textContent = pendingCount;
        })
        .catch(error => console.error('Error:', error));
    var user_groups = [];

    var adminApiUrl = "http://localhost:5500/user_session";
    fetch(adminApiUrl)
        .then((response) => response.json())
        .then((data) => {
            admin = data.admin;
            var user_id = data.user_id;
            if (user_id == null) {
                window.location.href = 'signin.html';
                return;
            }
            if (admin === "master") {
                var adminBtn = document.getElementsByClassName("admin")[0];
                adminBtn.style.display = "inline";
                adminBtn.addEventListener("click", function () {
                    window.location.href = 'control_panel.html';
                });
            }
        })
        .catch((error) => {
            console.error("Error fetching data from MongoDB:", error);
        });

    var apiUrl = "http://localhost:5500/user_groups";
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            user_groups = data.user_groups_res;
            checkStatus(user_groups);
        })
        .catch((error) => {
            console.error("Error fetching data from MongoDB:", error);
        });


    function checkStatus(user_groups) {
        user_groups.forEach(function (group) {
            var listGroup = document.querySelector(".list-group");
            var group_status = "";
            var statusByGroupApiUrl = `http://localhost:5500/group_status/${group.group}`;
            fetch(statusByGroupApiUrl)
                .then((response) => response.json())
                .then((status) => {
                    if (status.group_status == "active") {
                        group_status = "active";
                    }
                    else {
                        group_status = "inactive";
                    }

                    if (group_status == "active") {
                        var groupLink = document.createElement("a");
                        groupLink.href = "#";
                        groupLink.className = "list-group-item list-group-item-action";
                        groupLink.textContent = group.group;
                        listGroup.appendChild(groupLink);
                    }
                });
        });
    }

    var userDetailsApiUrl = "http://localhost:5500/user_details";
    fetch(userDetailsApiUrl)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            var profile_pic = data.users.profile_pic;
            var user_first_name = data.users.first_name;
            var user_last_name = data.users.last_name;

            $(document).ready(function () {
                $("#profileCircle").html(
                    '<img src="' + profile_pic + '" alt="Profile Image">'
                );
                $("#user-name").html(
                    '<span style="white-space: nowrap;">' + user_first_name + ' ' + user_last_name + ' <span>'
                );
            });
        })
        .catch((error) => {
            console.error("Error fetching data from MongoDB:", error);
        });

    var groupsSidebar = document.getElementById("groups-sidebar");
    var contentContainer = document.getElementById("content");
    groupsSidebar.addEventListener("click", function (event) {
        var targetLink = event.target.closest(".list-group-item");

        // Sidebar rendering
        if (targetLink) {
            event.preventDefault(); // Prevent the default link behavior
            var categoryName = targetLink.textContent.trim();
            clearPosts(); // Call the function to clear the posts

            contentContainer.classList.add("fade-in");

            var CurrentCategoriesApiUrl = "http://localhost:5500/posts/" + categoryName;
            fetch(CurrentCategoriesApiUrl)
                .then((response) => response.json())
                .then((posts) => {
                    var all_posts = posts.posts;
                    getPostsAndComments(all_posts);
                });
        }
    });

    var postsApiUrl = "http://localhost:5500/posts";
    fetch(postsApiUrl)
        .then((response) => response.json())
        .then((posts) => {
            var all_posts = posts.posts;
            getPostsAndComments(all_posts);
        })
        .catch((error) => {
            console.error("Error fetching posts:", error);
        });
});

// Render the posts and comments
function getPostsAndComments(all_posts) {
    var postsContainer = document.getElementById("section");
    var counter = 1;
    all_posts.forEach(function (post) {
        if (post.status == "pending") {
            return;
        }
        // Create the card div
        var cardDiv = document.createElement("div");
        cardDiv.className = "card mb-3";

        var deleteIcon = document.createElement("button");
        deleteIcon.className = "btn btn-danger ml-auto mt-2 mr-2 deleteIcon";
        deleteIcon.style.display = admin === "master" ? "inline" : "none";
        deleteIcon.innerHTML = '<i class="fa fa-times"></i>';
        deleteIcon.addEventListener("click", function () {
            // Replace this with your actual function to delete a post
            deletePost(post._id);
        });

        // Create the inner row div
        var rowDiv = document.createElement("div");
        rowDiv.className = "row no-gutters";

        // Create the image column
        var imageColumn = document.createElement("div");
        imageColumn.className = "col-md-2";
        var image = document.createElement("img");
        image.className = "card-img";
        image.src = post.pic; // Replace with the actual field in your post object
        image.alt = "...";
        imageColumn.appendChild(image);
        rowDiv.appendChild(imageColumn);

        // Create the text column
        var textColumn = document.createElement("div");
        textColumn.className = "col-md-7";
        var cardBody = document.createElement("div");
        cardBody.className = "card-body";
        var title = document.createElement("h4");
        title.className = "card-title font-weight-bold";
        title.textContent = post.title; // Replace with the actual field in your post object
        var cardText = document.createElement("div");
        cardText.className = "card-text";
        // Populate other fields as needed
        cardText.innerHTML = `
                <div style="margin-bottom: 9px;">
                    <span class="font-weight-bold" style="margin-bottom: 100px;">Group:
                    </span><span>${post.group_name}</span>
                    <br>
                    <span class="font-weight-bold" style="margin-bottom: 100px;">Host:
                    </span><span>${post.host}</span>
                    <br>
                    <span class="font-weight-bold" style="margin-bottom: 100px;">When:
                    </span><span>${post.date}, ${post.time}</span>
                    <br>
                    <span class="font-weight-bold" style="margin-bottom: 100px;">Duration:
                    </span><span>${post.duration} min'</span>
                    <br>
                    <span class="font-weight-bold" style="margin-bottom: 100px;">Location:
                    </span><span>${post.location}</span>
                </div>
                <p style="margin-bottom: 60px;">${post.description}</p>
                `;

        var cardLables = document.createElement("div");
        cardLables.className = "card-buttons";
        cardLables.innerHTML = `
                <div class="row justify-content-center" style="margin-bottom: 4px;">
                    <div class="col-sm-4 text-center font-weight-bold">
                        <span id="likeCount1${post._id}">${post.likes}</span>
                    </div>
                    <div class="col-sm-4 text-center font-weight-bold">
                        <span id="didItCount1${post._id}">${post.did}</span>
                    </div>
                    <div class="col-sm-4 text-center font-weight-bold">
                        <span id="commentsCount1">${post.comments}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-4 text-center"><button class="btn btn-primary btn-sm" onclick="toggleLike('${post._id}')" id="likeButton${post._id}" >Like</button>
                    </div>
                    <div class="col-sm-4 text-center"><button class="btn btn-success btn-sm"
                    onclick="toggleDidIt('${post._id}')" id="didItButton${post._id}"">I Did It!</button></div>
                    <div class="col-sm-4 text-center"><button class="btn btn-info btn-sm"
                            data-toggle="collapse"
                            data-target="#collapseComments${counter}">Comments</button></div>
                </div>
                `;

        var collapseElem = document.createElement("div");
        collapseElem.className = "collapse mt-3";
        collapseElem.id = "collapseComments" + counter;
        var accordionElem = document.createElement("div");
        accordionElem.id = "accordionComments" + counter;
        accordionElem.style = "margin-bottom: 70px";

        var commentsApiUrl = "http://localhost:5500/comments/" + post._id;
        fetch(commentsApiUrl)
            .then((response) => response.json())
            .then((comments) => {
                if (comments) {
                    const all_comments = comments.comments_res;

                    all_comments.forEach(function (comment) {
                        var card_comment = document.createElement("div");

                        var deleteIconComment = document.createElement("button");
                        deleteIconComment.className = "btn btn-danger ml-auto mt-2 mr-2 deleteIcon";
                        deleteIconComment.style.display = admin === "master" ? "inline" : "none";
                        deleteIconComment.innerHTML = '<i class="fa fa-times"></i>';
                        deleteIconComment.addEventListener("click", function () {
                            // Replace this with your actual function to delete a post
                            deleteComment(comment._id);
                        });

                        card_comment.className = "card";
                        card_comment.innerHTML = `
                    <div class="card-body">
                        <h6 class="card-title font-weight-bold">${comment.first_name} ${comment.last_name} <small>${comment.date}</small></h6>
                        <p class="card-text">${comment.description}</p>
                    </div>
                    `;
                        card_comment.appendChild(deleteIconComment);
                        collapseElem.appendChild(accordionElem);
                        accordionElem.appendChild(card_comment);
                    });
                }
            })
            .catch((error) => {
                console.error("Error fetching comments:", error);
            });

        // Check of post is liked or unliked
        var likeStatusApiUrl = "http://localhost:5500/get_likes/" + post._id;
        fetch(likeStatusApiUrl)
            .then((response) => response.json())
            .then((like_status) => {
                console.log("like_status " + like_status);
                const likeButton = document.getElementById(`likeButton${post._id}`);
                if (like_status == "Liked") {
                    likeButton.textContent = 'Unlike';
                }
                else if (like_status == "Unliked") {
                    likeButton.textContent = 'Like';
                }
            })
            .catch((error) => {
                console.error("Error fetching like status:", error);
            });

        cardBody.appendChild(title);
        cardBody.appendChild(cardText);
        cardBody.appendChild(cardLables);
        cardBody.appendChild(collapseElem);
        textColumn.appendChild(cardBody);
        rowDiv.appendChild(textColumn);

        // Append the row to the card
        cardDiv.appendChild(rowDiv);
        cardDiv.appendChild(deleteIcon);


        // Append the card to the container
        postsContainer.appendChild(cardDiv);

        counter++;
    });
}

function deletePost(post_id, all_posts) {
    $('#deletePostModal').modal('show');

    $('#confirmDeleteBtn').off('click').on('click', function () {
        console.log(`Delete post with ID: ${post_id}`);
        $.post(`http://localhost:5500/delete_post/${post_id}`, function (data) {
            clearPosts();
            var postsApiUrl = "http://localhost:5500/posts";
            fetch(postsApiUrl)
                .then((response) => response.json())
                .then((posts) => {
                    var all_posts = posts.posts;
                    getPostsAndComments(all_posts);
                })
                .catch((error) => {
                    console.error("Error fetching posts:", error);
                });
            $('#deletePostModal').modal('hide');
        });
    });
}

function deleteComment(comment_id, all_posts) {
    $('#deletePostModal').modal('show');

    $('#confirmDeleteBtn').off('click').on('click', function () {
        console.log(`Delete comment with ID: ${comment_id}`);
        $.post(`http://localhost:5500/delete_comment/${comment_id}`, function (data) {
            clearPosts();
            var postsApiUrl = "http://localhost:5500/posts";
            fetch(postsApiUrl)
                .then((response) => response.json())
                .then((posts) => {
                    var all_posts = posts.posts;
                    getPostsAndComments(all_posts);
                })
                .catch((error) => {
                    console.error("Error fetching posts:", error);
                });
            $('#deletePostModal').modal('hide');
        });
    });
}

function toggleLike(postId) {
    // URL for the like_posts API endpoint

    var likePostsApiUrl = `http://localhost:5500/like_posts/` + postId;

    // Make a POST request to the like_posts API
    fetch(likePostsApiUrl, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            // Check the response and update the UI accordingly
            if (data && data.post) {
                console.log(data);
                var updatedPost = data.post;
                console.log(updatedPost);
                var likeButton = document.getElementById(`likeButton${postId}`);
                var likeCountElement = document.getElementById(`likeCount1${postId}`);
                // Update the button text based on whether the post is liked or not
                if (likeButton.textContent === 'Unlike') {
                    // Update like count in UI
                    likeCountElement.textContent = updatedPost.likes;
                    likeButton.textContent = 'Like';
                } else {
                    // Update like count in UI
                    likeCountElement.textContent = updatedPost.likes;
                    likeButton.textContent = 'Unlike';
                }
            }
        })
        .catch(error => {
            console.error('Error toggling like:', error);
        });
}

function toggleDidIt(postId) {
    // URL for the like_posts API endpoint
    var didItPostsApiUrl = `http://localhost:5500/did_it/` + postId;

    // Make a POST request to the like_posts API
    fetch(didItPostsApiUrl, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            // Check the response and update the UI accordingly
            if (data && data.post) {
                console.log(data);
                var updatedPost = data.post;
                console.log(updatedPost);
                var didItButton = document.getElementById(`didItButton${postId}`);
                var didItCountElement = document.getElementById(`didItCount1${postId}`);
                // Update the button text based on whether the post is liked or not
                if (didItButton.textContent === "Not really...") {
                    // Update like count in UI
                    didItCountElement.textContent = updatedPost.did;
                    didItButton.textContent = 'I Did It!';
                } else {
                    // Update like count in UI
                    didItCountElement.textContent = updatedPost.did;
                    didItButton.textContent = "Not really...";
                }
            }
        })
        .catch(error => {
            console.error('Error toggling like:', error);
        });
}


function clearPosts() {
    var postsContainer = document.getElementById("section");
    postsContainer.innerHTML = ""; // Clear the content inside the section
}

function signout() {
    fetch('http://localhost:5500/signout', {
        method: 'GET',
    })
        .then(response => {
            if (response.ok) {
                window.location.href = 'welcome.html';
            } else {
                console.error('Sign out failed:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Sign out failed:', error);
        });
}