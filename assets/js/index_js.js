// Global Vairables
var admin = "";
var user_id = "";

let posts;

function redirectToSignin() {
    window.location.href = 'signin.html';
}

function redirectToCreatePost() {
    window.location.href = 'create_post.html';
}

function redirectToFitBot() {
    $.ajax({
        url: "http://localhost:5500/add_fitbot_clicks",
        method: "POST",
        dataType: "json",
        success: function (data) {
            window.location.href = 'fitbot.html';
        },
        error: function (error) {
            console.error("Error fetching data from MongoDB:", error);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var adminApiUrl = "http://localhost:5500/user_session";
    fetch(adminApiUrl)
        .then((response) => response.json())
        .then((data) => {
            admin = data.admin;
            user_id = data.user_id;
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

    fetch('http://localhost:5500/get_pendings')
        .then(response => response.json())
        .then(data => {
            const pendingCount = data.pending_posts_count; // Adjust according to your API response
            if (pendingCount === 0) {
                document.getElementById('post_badge').style.display = "none";
            }
            document.getElementById('post_badge').textContent = pendingCount;
        })
        .catch(error => console.error('Error:', error));
    var user_groups = [];

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

    var userGroupCount = 0;
    fetch('http://localhost:5500/count_user_groups')
        .then(response => response.json())
        .then(data => {
            userGroupCount = data.user_groups_count;
            fetchingPosts(userGroupCount);
        })
        .catch((error) => {
            console.error("Error fetching counter user groups:", error);
        });

    function fetchingPosts(userGroupCount = 1, posts_filtered = null) {
        updateUIForNewUser(userGroupCount)

        var user_groups_list = user_groups.map(function (group) {
            return group.group;
        });


        if (posts_filtered == null) {
            if (userGroupCount != 0) {
                var postsApiUrl = `http://localhost:5500/posts?groups=${encodeURIComponent(JSON.stringify(user_groups_list))}`;
                fetch(postsApiUrl)
                    .then((response) => response.json())
                    .then((posts) => {
                        var all_posts = posts.posts;
                        setPostsVariable(all_posts);
                        if (all_posts.length === 0) {
                            fetchingPosts();
                        }
                        getPostsAndComments(all_posts);
                    })
                    .catch((error) => {
                        console.error("Error fetching posts:", error);
                    });
            }
        }
    }

    function setPostsVariable(all_posts) {
        posts = all_posts;
    }

    function updateUIForNewUser(userGroupCount) {
        const noGroupsContent = document.getElementById('noGroupsContent');

        if (userGroupCount == 0) {
            console.log('User has no groups');
            // User has no groups, show the new user content
            noGroupsContent.classList.add("fade-in");
            noGroupsContent.style.display = 'block';
        }
    }

    // Rendering Posts and Comments
    function getPostsAndComments(all_posts) {
        //clear all posts first
        clearPosts();

        function parseDate(dateString) {
            var parts = dateString.split("/");
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }

        // Render the posts as Cards
        var postsContainer = document.getElementById("section");

        if (all_posts.length === 0) {
            console.log('No posts to show');
            var noPostsDiv = document.createElement("h1");
            noPostsDiv.innerText = "No posts yet, but they will be coming soon! 💪";
            noPostsDiv.style.textAlign = "center";
            noPostsDiv.style.position = "absolute";
            noPostsDiv.style.top = "50%";
            noPostsDiv.style.left = "50%";
            noPostsDiv.style.transform = "translate(-50%, -50%)";

            postsContainer.appendChild(noPostsDiv);
        }

        all_posts.forEach(function (post) {
            if (post.status == "pending") {
                return;
            }
            // Create the card div
            var cardDiv = document.createElement("div");
            cardDiv.className = "card mb-3";

            var deleteIcon = document.createElement("button");
            deleteIcon.className = "btn btn-danger ml-auto mt-2 mr-2 deleteIcon";
            deleteIcon.style.display = (admin === "master" || post.user_id === user_id) ? "inline" : "none";
            deleteIcon.innerHTML = '<i class="fa fa-times"></i>';
            deleteIcon.addEventListener("click", function () {
                deletePost(post._id);
            });
            deleteIcon.innerHTML = '<i class="fa fa-times"></i>';
            deleteIcon.addEventListener("click", function () {
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
            image.src = post.pic;
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
            title.textContent = post.title;
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
                            </span><span id="locationSpan${post._id}" style="cursor: pointer; color: #0022c9;">${post.location}</span>
                        </div>
                        <p style="margin-bottom: 60px;">${post.description}</p>
                        `;

            setTimeout(function () {
                var locationSpan = document.getElementById(`locationSpan${post._id}`);
                if (locationSpan) {
                    locationSpan.addEventListener('click', function () {
                        openGoogleMaps(post.location);
                    });
                }
            }, 0);

            // Add the function to open Google Maps
            function openGoogleMaps(location) {
                var encodedLocation = encodeURIComponent(location);
                var googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                window.open(googleMapsUrl, '_blank'); // Opens in a new tab
            }

            var cardLables = document.createElement("div");
            cardLables.className = "card-buttons";
            cardLables.innerHTML = `
                        <div class="row justify-content-center">
                            <div class="col-sm-4 text-center font-weight-bold">
                                <span id="likeCount${post._id}">${post.likes}</span>
                            </div>
                            <div class="col-sm-4 text-center font-weight-bold">
                                <span id="didItCount${post._id}">${post.did}</span>
                            </div>
                            <div class="col-sm-4 text-center font-weight-bold">
                                <span id="commentsCount${post._id}">${post.comments}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-4 text-center">
                                <i class="fa fa-thumbs-up fa-2x cursor" aria-hidden="true" onclick="toggleLike('${post._id}')" id="likeButton${post._id}" ></i>
                            </div>
                            <div class="col-sm-4 text-center">
                                <i class="fa fa-check fa-2x cursor" aria-hidden="true" onclick="toggleDidIt('${post._id}')" id="didItButton${post._id}"></i>
                            </div>
                            <div class="col-sm-4 text-center">
                                <i class="fa fa-comment fa-2x cursor" aria-hidden="true" data-toggle="collapse"
                                    data-target="#collapseComments${post._id}"></i>
                            </div>
                            
                        </div>
                        `;

            var collapseElem = document.createElement("div");
            collapseElem.className = "collapse mt-3";
            collapseElem.id = "collapseComments" + post._id;
            var accordionElem = document.createElement("div");
            accordionElem.id = "accordionComments" + post._id;
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
                            deleteIconComment.style.display = (admin === "master" || comment.user_id === user_id) ? "inline" : "none";
                            deleteIconComment.innerHTML = '<i class="fa fa-times"></i>';
                            deleteIconComment.addEventListener("click", function () {
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

                        // Create comment card
                        var card_comment = document.createElement("div");
                        card_comment.className = "card";
                        card_comment.style.border = "none"; // Add this line to remove the border

                        card_comment.innerHTML = `
        
                            <div class="card-body card-body-submit" style="display: flex; align-items: center;">
                                <div class="form-group" style="display: flex; width: 100%;">
                                    <input type="text" class="form-control" id="addComment${post._id}" placeholder="Add a comment..." style="flex-grow: 1; padding-right: 30px; border-radius: 20px; position: relative; box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);">
                                    <i class="fa fa-paper-plane" aria-hidden="true" id="submitComment${post._id}" style="position: absolute;right: 10px;top: 10px;cursor: pointer;margin-top: 1.3%;margin-right: 2%;"></i>
                                </div>
                            </div>
                            `;

                        collapseElem.appendChild(accordionElem);
                        accordionElem.appendChild(card_comment);

                        var submitButton = document.getElementById(`submitComment${post._id}`);
                        submitButton.addEventListener('click', function () {
                            addComment(post._id); // Call addComment function when the submit button is clicked
                        });

                        document.getElementById(`addComment${post._id}`).addEventListener('keypress', function (e) {
                            console.log("B4 Enter pressed");
                            if (e.key === 'Enter') {
                                console.log("Enter pressed");
                                addComment(post._id);
                            }
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
                    const likeButton = document.getElementById(`likeButton${post._id}`);
                    if (like_status.message == "Liked") {
                        likeButton.style = "color: #016afb;";
                        likeButton.classList.add("liked");
                    }
                    else if (like_status.message == "Unliked") {
                        likeButton.style = "color: #000000;";
                    }
                })
                .catch((error) => {
                    console.error("Error fetching like status:", error);
                });

            // Check of post is did it or not yet
            var didsStatusApiUrl = "http://localhost:5500/get_did_its/" + post._id;
            fetch(didsStatusApiUrl)
                .then((response) => response.json())
                .then((did_status) => {
                    const didButton = document.getElementById(`didItButton${post._id}`);
                    if (did_status.message == "Not yet...") {
                        didButton.style = "color: #000000;";
                    }
                    else if (did_status.message == "I Did It!") {
                        didButton.style = "color: #59ba52;";
                        didButton.classList.add("didIt");
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

            cardDiv.classList.add('effect-fadeIn');
            // Append the card to the container
            postsContainer.appendChild(cardDiv);

        });
    }

    function deletePost(post_id, all_posts) {
        $('#deletePostModal').modal('show');

        $('#confirmDeleteBtn').off('click').on('click', function () {
            console.log(`Delete post with ID: ${post_id}`);
            $.post(`http://localhost:5500/delete_post/${post_id}`, function (data) {
                clearPosts();
                fetchingPosts();
                $('#deletePostModal').modal('hide');
            });
        });
    }

    function addComment(post_id) {
        var commentInput = document.getElementById(`addComment${post_id}`);
        var userComment = commentInput.value.trim(); // Get the comment input by the user

        if (userComment !== '') {
            var addCommentApiUrl = `http://localhost:5500/add_comment/${post_id}`;
            fetch(addCommentApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description: userComment }) // Sending the comment as JSON in the request body
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        console.log(data);
                        // If the comment was successfully added, clear the input field
                        commentInput.value = '';
                        appendNewCommentToUI(data.comment, data.comment_id, post_id);
                    } else {
                        console.error('Failed to add comment:', data.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                });
        } else {
            console.error('Empty comment. Please enter a comment to add.');
        }
    }

    function appendNewCommentToUI(comment, comment_id, post_id) {
        var commentsContainer = document.getElementById(`accordionComments${post_id}`);
        if (commentsContainer) {
            var card_comment = document.createElement("div");
            card_comment.className = "card";


            var deleteIconComment = document.createElement("button");
            deleteIconComment.className = "btn btn-danger ml-auto mt-2 mr-2 deleteIcon";
            deleteIconComment.style.display = (admin === "master" || comment.user_id === user_id) ? "inline" : "none";
            deleteIconComment.innerHTML = '<i class="fa fa-times"></i>';
            deleteIconComment.addEventListener("click", function () {
                deleteComment(comment_id);
            });

            card_comment.innerHTML = `
                    <div class="card-body">
                        <h6 class="card-title font-weight-bold">${comment.first_name} ${comment.last_name} <small>${comment.date}</small></h6>
                        <p class="card-text">${comment.description}</p>
                    </div>
                `;
            card_comment.appendChild(deleteIconComment);

            // Find the comment input card to insert the new comment before it
            var commentInputCard = document.querySelector(`#accordionComments${post_id} > .card:last-child`);
            if (commentInputCard) {
                commentsContainer.insertBefore(card_comment, commentInputCard);
            } else {
                commentsContainer.appendChild(card_comment);
            }

            var commentCountElement = document.getElementById(`commentsCount${post_id}`);
            var commentCount = parseInt(commentCountElement.textContent);
            console.log("commentCount" + commentCount);
            commentCountElement.textContent = commentCount + 1;
            console.log("commentCount" + commentCount);
        } else {
            console.error('Comments container not found for post_id:', post_id);
        }
    }

    function deleteComment(comment_id, all_posts) {
        $('#deletePostModal').modal('show');

        $('#confirmDeleteBtn').off('click').on('click', function () {
            console.log(`Delete comment with ID: ${comment_id}`);
            $.post(`http://localhost:5500/delete_comment/${comment_id}`, function (data) {
                clearPosts();
                fetchingPosts();
                $('#deletePostModal').modal('hide');
            });
        });
    }

    function clearPosts() {
        var postsContainer = document.getElementById("section");

        var posts = postsContainer.getElementsByClassName("card mb-3");
        Array.from(posts).forEach(function (post) {
            post.classList.remove('effect-fadeIn');
        });

        postsContainer.innerHTML = ""; // Clear the content inside the section
    }

    $('#search_dropdown').on('click', 'a.dropdown-item', function () {
        var selectedValue = $(this).attr('value');
        $('#dropdownButton').html($(this).text() + ' <i class="fa fa-caret-down" aria-hidden="true"></i>');
        $('#dropdownButton').attr('value', selectedValue);
        filterUsers(selectedValue); // Add this line to pass the selected value
    });

    let lastSearchClickTime = 0;
    let lastClearClickTime = 0;
    const clickDelay = 2000; // 2 seconds delay

    document.getElementById('searchButton').addEventListener('click', function () {
        const currentTime = new Date().getTime();
        if (currentTime - lastSearchClickTime > clickDelay) {
            lastSearchClickTime = currentTime;
            const selectedValue = document.getElementById('dropdownButton').getAttribute('value');
            filterUsers(selectedValue);
        } else {
            console.log("Please wait before searching again.");
        }
    });

    $("#clearSearch").on("click", function () {
        const currentTime = new Date().getTime();
        if (currentTime - lastClearClickTime > clickDelay) {
            lastClearClickTime = currentTime;
            $("#searchText").val(""); // Clear the search input
            const selectedValue = $("#dropdownButton").attr('value');
            filterUsers(selectedValue); // Filter users after clearing search input
        } else {
            console.log("Please wait before clearing again.");
        }
    });

    function filterUsers(criteria) {
        const searchText = $("#searchText").val().toLowerCase();
        const filteredUsers = filterByText(searchText, criteria);
        getPostsAndComments(filteredUsers);
    }

    function filterByText(text, criteria) {
        const lowercaseText = text.toLowerCase();
        return posts.filter(function (post) {
            const value = post[criteria].toLowerCase();
            return value.includes(text);
        });
    }

    $('#sort_dropdown').on('click', 'a.dropdown-item', function () {
        var selectedSort = $(this).attr('value');
        sortPosts(selectedSort);
    });

    function parseDate(dateString, format = "/") {
        if (format === "/") {
            var parts = dateString.split("/");
            var formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            var parts = dateString.split(".");
            var formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        console.log(`Parsed date for ${dateString}: ${formattedDate}`);
        return formattedDate;
    }

    function sortPosts(sortType) {
        if (!posts) {
            console.log("No posts to sort");
            return;
        }

        console.log("Sorting posts...");
        console.log(`Sorting posts by ${sortType}`);

        switch (sortType) {
            case 'created-older':
                console.log("Sorting by created-older");
                posts.sort((a, b) => {
                    const dateA = parseDate(a.created, ".");
                    const dateB = parseDate(b.created, ".");
                    return dateA - dateB;
                });
                break;
            case 'created-newer':
                console.log("Sorting by created-newer");
                posts.sort((a, b) => {
                    const dateA = parseDate(a.created, ".");
                    const dateB = parseDate(b.created, ".");
                    return dateB - dateA;
                });
                // posts.reverse(); // Reverse the posts list
                break;
            case 'when-closest':
                console.log("Sorting by when-closest");
                posts.sort((a, b) => {
                    const dateA = parseDate(a.date);
                    const dateB = parseDate(b.date);
                    return dateA - dateB;
                });
                break;
            case 'when-farest':
                console.log("Sorting by when-farest");
                posts.sort((a, b) => {
                    const dateA = parseDate(a.date);
                    const dateB = parseDate(b.date);
                    return dateB - dateA;
                });
                break;
        }

        console.log("Sorted posts: ", posts);
        getPostsAndComments(posts);
    }

    document.getElementById('profileCircle').addEventListener('click', fetchAndDisplayUserPosts);
    document.getElementById('profileCircle').style.cursor = "pointer";
    document.getElementById('user-name').addEventListener('click', fetchAndDisplayUserPosts);
    document.getElementById('user-name').style.cursor = "pointer";

    function fetchAndDisplayUserPosts() {
        fetch(`http://localhost:5500/posts/get_posts/${user_id}`)
            .then(response => response.json())
            .then(posts => {
                console.log('Posts:', posts);
                getPostsAndComments(posts.posts);
            })
            .catch(error => console.error('Error:', error));
    }
});

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
                var likeCountElement = document.getElementById(`likeCount${postId}`);
                // Update the button text based on whether the post is liked or not
                if (likeButton.classList.contains('liked')) {

                    // Update like count in UI
                    likeCountElement.textContent = updatedPost.likes;
                    likeButton.style = "color: #000000;";
                    likeButton.classList.remove('liked');

                } else {
                    // Update like count in UI
                    likeCountElement.textContent = updatedPost.likes;
                    likeButton.style = "color: #016afb;";
                    likeButton.classList.add('liked');
                }
            }
        })
        .catch(error => {
            console.error('Error toggling like:', error);
        });
}

function toggleDidIt(postId) {
    var didItPostsApiUrl = `http://localhost:5500/did_its/` + postId;

    // Make a POST request to the like_posts API
    fetch(didItPostsApiUrl, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.post) {
                var updatedPost = data.post;
                var didItButton = document.getElementById(`didItButton${postId}`);
                var didItCountElement = document.getElementById(`didItCount${postId}`);
                if (didItButton.classList.contains('didIt')) {
                    didItCountElement.textContent = updatedPost.did;
                    didItButton.style = "color: #000000;";
                    didItButton.classList.remove('didIt');
                } else {
                    didItCountElement.textContent = updatedPost.did;
                    didItButton.style = "color: #59ba52;";
                    didItButton.classList.add('didIt');
                }
            }
        })
        .catch(error => {
            console.error('Error toggling like:', error);
        });
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