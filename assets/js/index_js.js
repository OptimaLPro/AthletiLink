var admin = "";

function redirectToCreatePost() {
    window.location.href = 'create_post.html';
}

document.addEventListener("DOMContentLoaded", function () {
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

            // async function getGroupStatus(group) {
            //     try {
            //         // console.log("IM HERE" + group.group);
            //         const response = await fetch(`http://localhost:5500/group_status/${group.group}`);
            //         // console.log(response);
            //         const data = await response.json();

            //         console.log(data);

            //         if (data.group_status == "active") {
            //             console.log("active");
            //             group_status = "active";
            //         } else {
            //             group_status = "inactive";
            //         }
            //     } catch (error) {
            //         console.error("Error fetching group status:", error);
            //     }
            // }
        })
        .catch((error) => {
            console.error("Error fetching data from MongoDB:", error);
        });


    function checkStatus(user_groups) {
        user_groups.forEach(function (group) {
            var listGroup = document.querySelector(".list-group");
            var group_status = "";
            // console.log(group.group);
            // $.post(`http://localhost:5500/group_status/${group.group}`, function (data) {
            //     console.log(data);
            //     if (data.status == "active") {
            //         group_status = "active";
            //     }
            //     else {
            //         group_status = "inactive";
            //     }
            // });

            // getGroupStatus(group);

            var statusByGroupApiUrl = `http://localhost:5500/group_status/${group.group}`;
            fetch(statusByGroupApiUrl)
                .then((response) => response.json())
                .then((status) => {
                    console.log(status);
                    if (status.group_status == "active") {
                        console.log("THIS IS !active!");
                        group_status = "active";
                    }
                    else {
                        group_status = "inactive";
                    }

                    console.log("AAAAA " + group_status);
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
            console.log(categoryName);
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
                        <span id="likeCount1">${post.likes}</span>
                    </div>
                    <div class="col-sm-4 text-center font-weight-bold">
                        <span id="didItCount1">${post.did}</span>
                    </div>
                    <div class="col-sm-4 text-center font-weight-bold">
                        <span id="didItCount1">${post.comments}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-4 text-center"><button class="btn btn-primary btn-sm" onclick="toggleLike('${post._id}')" id="likeButton${post._id}">Like</button>
                    </div>
                    <div class="col-sm-4 text-center"><button class="btn btn-success btn-sm"
                            onclick="return false;">I Did
                            It!</button></div>
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
                        <h5 class="card-title">${comment.first_name} ${comment.last_name}</h5>
                        <p class="card-text">${comment.description}</p>
                        <span class="font-weight-bold">${comment.date}</span>
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
    const likeButton = document.getElementById(`likeButton${postId}`);

    // Check if the button currently says 'Like' or 'Unlike'
    const isLiked = likeButton.textContent.trim() === 'Unlike';

    // Perform a fetch request to toggle the like status
    fetch(`http://localhost:5500/like_posts/${postId}`, {
        method: isLiked ? 'DELETE' : 'POST', // If it's liked, send DELETE request, else send POST
        headers: {
            'Content-Type': 'application/json',
            // You can add more headers if required (e.g., authorization token)
        },
        // You can include a request body if needed for the POST request
        // body: JSON.stringify({ postId }), 
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to toggle like');
            }
        })
        .then(data => {
            // Toggle the button text and style based on the response
            if (isLiked) {
                likeButton.textContent = 'Like';
                // Update button styling or do other UI changes if needed
            } else {
                likeButton.textContent = 'Unlike';
                // Update button styling or do other UI changes if needed
            }
            // You can handle additional logic based on the response data if required
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors or show error messages to the user
        });
}

//-----------------------------------------------------------------------------------------------------------
// function toggleLike(postId) {
//     console.log("HEYYYYYYYsdlkfj234o5");
//     fetch('/toggle-like-endpoint', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ postId: postId }),
//     })
//         console.log(postId)
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 // Update the UI based on the new like status
//                 const likeCountElement = document.getElementById(`likeCount${postId}`);
//                 const currentLikes = parseInt(likeCountElement.innerText);

//                 if (data.liked) {
//                     // If the post is now liked, increment the like count
//                     likeCountElement.innerText = currentLikes + 1;
//                 } else {
//                     // If the post is now unliked, decrement the like count
//                     likeCountElement.innerText = currentLikes - 1;
//                 }

//                 // Update the button text based on the new like status
//                 const likeButton = document.getElementById(`likeButton${postId}`);
//                 likeButton.innerText = data.liked ? 'Unlike' : 'Like';
//             } else {
//                 // Handle error
//                 console.error('Failed to toggle like status');
//             }
//         });
// }

function clearPosts() {
    console.log("clearPosts");
    var postsContainer = document.getElementById("section");
    postsContainer.innerHTML = ""; // Clear the content inside the section
    console.log("DONE");
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