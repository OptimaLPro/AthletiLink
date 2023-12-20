const express = require("express");
const crypto = require("crypto");
var session = require("express-session");
var bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const Users = require("./models/users");
const User_groups = require("./models/user_groups");
const Posts = require("./models/posts");
const Comments = require("./models/comments");
const Groups = require("./models/groups");
const Logs = require("./models/logs");
const Likes = require("./models/likes");
const did_it = require("./models/did_it");

app.use(express.static('assets'));
const port = 5500;

// ---------- Session ----------
session.user_id = null;
session.admin = null;

const generateRandomString = () => {
  return crypto.randomBytes(32).toString("hex");
};

app.use(
  session({
    secret: generateRandomString(),
    resave: false,
    saveUninitialized: true,
    user_id: null,
    admin: null
  })
);

// ---------- Create Log function ----------
const createLog = async (event_type, description, req, response = "") => {
  try {
    await Logs.create({
      timestamp: new Date().toISOString(),
      user_id: `${session.user_id}`,
      event_type: event_type,
      description: description,
      response: response,
      ip_address: req ? req.ip : "unknown",
    });
  } catch (error) {
    console.error("Error logging:", error);
  }
};

// ---------- Body Parser ----------
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// ---------- CORS ----------
const cors = require("cors");
const { log } = require("console");
const { create } = require("domain");
const likes = require("./models/likes");
const { url } = require("inspector");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ****************************** //
// ********** Session  ********** //
// ****************************** //

// ---------- Home Page - Redirect By Session  ----------
// app.get("/", (req, res) => {

//   if (session.user_id) {
//     res.sendFile(__dirname + "/index.html");
//   } else {
//     res.redirect("signin.html");
//   }
// });

// ---------- Create User ----------
app.post("/user", async (req, res) => {
  try {
    var data = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      date: req.body.dob,
      profile_pic: req.body.profilePictureUrl,
      admin: "",
      secret_phrase: req.body.secretPhrase

    };
    var db = mongoose.connection;
    db.collection("users").insertOne(data, (err, collection) => {
      if (err) {
        throw err;
      }
      session.user_id = collection.insertedId;
      console.log("User Created Successfully");
    });

    return res.redirect("http://127.0.0.1:5500/SignupRedirect.html");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Create SessionID with UserID ----------
app.get("/SetSessionID/:user_id", async (req, res) => {
  try {
    const the_user_id = req.params.user_id;

    if (!the_user_id) {
      return res.status(404).json({ message: "Invalid Session ID" });
    }
    session.user_id = the_user_id;
    const user = await Users.findById(the_user_id);
    const admin = user.admin;

    if (admin === "master") {
      session.admin = "master";
      console.log("Admin User");
    }

    createLog("Signin", "", req);
    res.status(200).json({ the_user_id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Sign out ---------
app.get("/signout", async (req, res) => {
  try {
    createLog("Signout", "", req);
    session.user_id = null;
    session.admin = null;
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ********************************** //
// ********** Users Model  ********** //
// ********************************** //

// ---------- Get User By ID ----------
app.get("/user/:id", async (req, res) => {
  try {
    const users = await Users.findById(req.params.id);
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get User By Session ----------
app.get("/user_session", async (req, res) => {
  try {
    const user_id = session.user_id;
    const admin = session.admin;
    res.status(200).json({ user_id, admin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get User By ID ----------
app.get("/user_details", async (req, res) => {
  try {
    const users = await Users.findById(session.user_id);
    // console.log(users)
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get User By Email ----------
app.get("/getUserByMail/:email", async (req, res) => {
  try {
    const users = await Users.findOne({ email: req.params.email });
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get All Users ----------
app.get("/getUsers", async (req, res) => {
  try {
    const users = await Users.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Update User ----------
app.post("/update_user", async (req, res) => {
  try {
    if (req.body.newpassword == "") {
      var data = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        date: req.body.dob,
      };
    } else {
      var data = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        password: req.body.newpassword,
        date: req.body.dob,
      };
    }

    const updatedFields = data;
    const updatedUser = await Users.findByIdAndUpdate(session.user_id, updatedFields, {
      new: true, // Return the updated document
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User Updated Successfully:", updatedUser);
    return res.redirect("http://127.0.0.1:5500/index.html");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Delete User by ID ----------
app.post("/delete_user/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const deletedUser = await Users.findByIdAndDelete(user_id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User Deleted Successfully:", deletedUser);
    createLog("Delete User", `${user_id}`, req);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Update User By ID ----------
app.post("/update_user/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    var data = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      password: req.body.password,
      email: req.body.email,
      date: req.body.dob,
      secret_phrase: req.body.secretPhrase,
      admin: req.body.admin,
    };

    const updatedFields = data;

    const updatedUser = await Users.findByIdAndUpdate(user_id, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    createLog("User Update", `Updated: ${user_id}`, req, updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/*
---------- Update User Profile Picture ----------
app.post("/update_profile_picture/:url", async (req, res) => {
  const img_url = req.params.url;
  try {
    var data = {
      profile_pic: url.toString(),
    };

    const updatedFields = data;

    const updatedUser = await Users.findByIdAndUpdate(user_id, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    createLog("User Update", `Updated: ${user_id}`, req, updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});
*/

// **************************************** //
// ********** User Groups Model  ********** //
// **************************************** //

// ---------- Get All Users Groups By Session ID ----------
app.get("/user_groups/", async (req, res) => {
  try {
    const user_groups_res = await User_groups.find({
      user_id: session.user_id,
    });

    if (!user_groups_res) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user_groups_res });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get All Users Groups By ID ----------
app.get("/user_groups/:user_id", async (req, res) => {
  try {
    const user_groups_res = await User_groups.find({
      user_id: req.params.user_id,
    });

    if (!user_groups_res) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user_groups_res });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Delete User Group By ID ----------
app.post("/delete_user_group/:user_group_id", async (req, res) => {
  try {
    const user_group_id = req.params.user_group_id;
    const group = await User_groups.findById(user_group_id);

    if (!group) {
      return res.status(404).json({ message: "User Group not found" });
    }

    await group.deleteOne();

    createLog("User Group Deleted", `${user_group_id}`, req);
    res.status(200).json({ message: "User Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Failed to delete group" });
  }
});

// ---------- Add user groups ----------
app.post("/add_user_groups", (req, res) => {
  try {
    const { newSelectedCategories } = req.body;

    newSelectedCategories.forEach(async (category) => {
      await User_groups.create({ user_id: session.user_id, group: category });
    });

    res.status(200).json({ message: "New user groups added successfully" });
  } catch (error) {
    console.error("Error adding user groups to the database:", error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Add user groups by User ID and Group Name ----------
app.post("/add_user_group/:user_id/:group_name", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const group_name = req.params.group_name;

    var data = {
      user_id: user_id,
      group: group_name
    };

    var db = mongoose.connection;
    const result = await db.collection("user_groups").insertOne(data); // Use await to wait for the operation to complete
    createLog("Create User Group", `${user_id}: ${group_name}`, req);
    res.status(200).json({ message: "New user group added successfully" });
  } catch (error) {
    console.error("Error adding user groups to the database:", error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Remove user groups ----------
app.post("/remove_user_groups", (req, res) => {
  try {
    const { unselectedCategories } = req.body;

    unselectedCategories.forEach(async (category) => {
      await User_groups.deleteOne({ user_id: session.user_id, group: category });
    });

    res.status(200).json({ message: "User groups removed successfully" });
  } catch (error) {
    console.error("Error removing user groups from the database:", error);
    res.status(500).json({ message: error.message });
  }
});

// ********************************** //
// ********** Posts Model  ********** //
// ********************************** //

// ---------- Get All Posts ----------
app.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.find({});
    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//----------- Get Post By ID -------------
app.get('/posts_id/:postId', async (req, res) => {
  const post_id = req.params.postId;
  try {
    const foundPost = await Posts.findById(post_id);

    if (!foundPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ post: foundPost });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Create Post ----------
app.post("/create_post", async (req, res) => {
  try {
    const user = await Users.findById(session.user_id);

    var data = {
      user_id: session.user_id,
      title: req.body.title,
      pic: req.body.profilePictureUrl,
      host: user.first_name + " " + user.last_name,
      duration: req.body.duration,
      lcoation: req.body.location,
      description: req.body.description,
      likes: 0,
      did: 0,
      comments: 0,
      group_name: req.body.group,
      date: req.body.date,
      time: req.body.time,
      status: "pending"

    };

    var db = mongoose.connection;
    const result = await db.collection("posts").insertOne(data); // Use await to wait for the operation to complete
    const post_id = result.insertedId;
    createLog("Post Created", `${post_id}`, req, result);
    return res.redirect("http://127.0.0.1:5500/index.html");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Update Post By ID ----------
app.post("/update_post/:post_id", async (req, res) => {
  const post_id = req.params.post_id;
  try {
    var data = {
      user_id: req.body.firstName,
      title: req.body.title,
      host: req.body.host,
      duration: req.body.duration,
      location: req.body.location,
      description: req.body.description,
      group_name: req.body.group_name,
      likes: req.body.likes,
      did: req.body.did,
      date: req.body.date,
      time: req.body.time,
      status: req.body.status
    };

    const updatedFields = data;

    const updatedPost = await Posts.findByIdAndUpdate(post_id, updatedFields, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: "User not found" });
    }
    createLog("Post Update", `Updated: ${post_id}`, req, updatedPost);
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Delete Post by ID ----------
app.post("/delete_post/:post_id", async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const post = await Posts.findById(post_id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.deleteOne();
    createLog("Delete Post", `${post_id}`, req);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// ---------- Get Posts by Group Name ----------
app.get("/posts/:group_name", async (req, res) => {
  try {
    const posts = await Posts.find({ group_name: req.params.group_name });
    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Approve Post ----------
app.post("/approve_post/:post_id", async (req, res) => {
  const post_id = req.params.post_id;
  try {
    var data = {
      status: 'approved'
    };

    const updatedFields = data;

    const updatedPost = await Posts.findByIdAndUpdate(post_id, updatedFields, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    createLog("Post Approved", `${post_id}`, req, updatedPost);
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get Posts Pending Count ----------
app.get("/get_pendings", async (req, res) => {
  try {
    const pending_posts = await Posts.find({ status: "pending" });
    const pending_posts_count = pending_posts.length;
    res.status(200).json({ pending_posts_count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// *********************************** //
// ********** Groups Model  ********** //
// *********************************** //

// ---------- Get All Groups ----------
app.get("/groups", async (req, res) => {
  try {
    const groups = await Groups.find({});
    res.status(200).json({ groups });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Create a Group ----------
app.post("/create_group", async (req, res) => {
  group_name = req.body.group_name;
  try {
    var data = {
      group_name: req.body.group_name,
      pic: req.body.pic,
      status: req.body.status
    };

    var db = mongoose.connection;
    const result = await db.collection("groups").insertOne(data); // Use await to wait for the operation to complete
    createLog("Group Created", `${group_name}`, req, result);
    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Update Group By ID ----------
app.post("/update_group/:group_id", async (req, res) => {
  const group_id = req.params.group_id;
  try {
    var data = {
      group_name: req.body.group_name,
      pic: req.body.pic,
      status: req.body.status
    };

    const updatedFields = data;

    const updatedGroup = await Groups.findByIdAndUpdate(group_id, updatedFields, {
      new: true,
    });

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    createLog("Group Update", `Updated: ${group_id}`, req, updatedGroup);
    return res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Delete Group By ID ----------
app.post("/delete_group/:group_id", async (req, res) => {
  try {
    const group_id = req.params.group_id;
    const group = await Groups.findById(group_id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await group.deleteOne();

    createLog("Group Deleted", `${group_id}`, req);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Failed to delete group" });
  }
});

// ---------- Group Status By Group Name ----------
app.get("/group_status/:group_name", async (req, res) => {
  try {
    const group_name = req.params.group_name;
    const group = await Groups.find({ group_name: group_name });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group_status = group[0].status;

    res.status(200).json({ group_status });
  } catch (error) {
    console.error("Error returning group status:", error);
    res.status(500).json({ message: "Error returning group status" });
  }
});

// *********************************** //
// ********** Comments Model  ********** //
// *********************************** //

// ---------- Get All Comments ----------
app.get("/comments", async (req, res) => {
  try {
    const comments = await Comments.find({});
    res.status(200).json({ comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get Comments By Post ID ----------
app.get("/comments/:post_id", async (req, res) => {
  try {
    const comments_res = await Comments.find({ post_id: req.params.post_id });

    if (!comments_res) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ comments_res });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Update Comment By ID ----------
app.post("/update_comment/:comment_id", async (req, res) => {
  const comment_id = req.params.comment_id;
  try {
    var data = {
      post_id: req.body.post_id,
      user_id: req.body.user_id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
    };

    const updatedFields = data;

    const updatedComment = await Comments.findByIdAndUpdate(comment_id, updatedFields, {
      new: true,
    });

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    createLog("Comment Update", `Updated: ${comment_id}`, req, updatedComment);
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Delete Comment By ID ----------
app.post("/delete_comment/:comment_id", async (req, res) => {
  try {
    const comment_id = req.params.comment_id;
    const comment = await Comments.findById(comment_id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const post_id = comment.post_id;

    await comment.deleteOne();

    const post = await Posts.findById(post_id);
    new_comments_counter = post.comments - 1;
    data = {
      comments: new_comments_counter
    }

    const updatedPost = await Posts.findByIdAndUpdate(post_id, data, {
      new: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ message: "post not found" });
    }

    createLog("Delete Comment", `${comment_id}`, req);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

// ********************************* //
// ********** Like Model  ********** //
// ********************************* //

// ---------- Like Post ----------
// app.post("/like_post/:post_id", async (req, res) => {
//   try {
//     const postId = req.params.post_id;
//     const userId = session.user_id;

//     const post = await Posts.findById(postId);

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     // Check if the user has already liked the post
//     const userLiked = post.likes.includes(userId);

//     if (userLiked) {
//       // Unlike the post
//       post.likes = post.likes.filter((id) => id !== userId);
//     } else {
//       // Like the post
//       post.likes.push(userId);
//     }

//     await post.save();

//     res.status(200).json({ likes: post.likes.length });
//   } catch (error) {
//     console.error("Error updating like status:", error);
//     res.status(500).json({ message: "Failed to update like status" });
//   }
// });

//----------- Like API -------------
app.post('/like_posts/:postId', async (req, res) => {
  console.log("like post");
  const post_id = req.params.postId;
  try {
    const foundPost = await Posts.findById(post_id);
    console.log(foundPost);

    if (!foundPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const foundLike = await Likes.findOne({ post_id: post_id, user_id: session.user_id });
    console.log(foundLike);
    let updateLikes;
    console.log("foundLike");
    console.log(foundLike);
    if (foundLike) {
      updateLikes = foundPost.likes - 1;
      await foundLike.deleteOne();
    }
    else {
      updateLikes = foundPost.likes + 1;
      const foundUser = await Users.findById(session.user_id);

      if (!foundUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const likes_data = {
        post_id: post_id,
        user_id: session.user_id,
        first_name: foundUser.first_name,
        last_name: foundUser.last_name
      }
      console.log(likes_data);
      const db = mongoose.connection;
      const results = await db.collection("likes").insertOne(likes_data);
      console.log(results);
    }

    const data = {
      likes: updateLikes
    };

    const updatedPost = await Posts.findByIdAndUpdate(post_id, data, {
      new: true,
    });

    console.log(updatedPost);
    if (!updatedPost) {
      return res.status(404).json({ message: "Can't update" });
    }

    return res.status(200).json({ message: 'Likes updated successfully', post: updatedPost, like: foundLike });
  } catch (error) {
    console.error(error); // log the error
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//----------- Get Like By Post ID -------------
app.get('/get_likes/:postId', async (req, res) => {
  const post_id = req.params.postId;
  try {
    const foundPost = await Likes.find({ post_id: post_id, user_id: session.user_id });

    if (foundPost) {
      return res.status(200).json({ message: 'Unliked' });
    }

    return res.status(200).json({ message: 'Liked' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//----------- add like info -------------
// app.post('/add_like/:postId', async (req, res) => {
//   const postId = req.params.postId;

//   try {
//     const foundPost = await likes.findById(postId);


//     if (!foundPost) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     newLikes = foundPost.likes + 1;
//     data = {
//       post_id: postId,
//       user_id: session.user_id
//     }
//     var db = mongoose.connection;
//     const updatedPost = await likes.findByIdAndUpdate(postId, data, {
//       new: true, // Return the updated document
//     });
//     if (!updatedPost) {
//       return res.status(404).json({ message: "post not found" });
//     }
//     console.log(foundPost); 
//     return res.status(200).json({ message: 'Likes updated successfully', post: foundPost });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// *********************************** //
// ********** Did it Model  ********** //
// *********************************** //

//----------------- Did it API -----------------
app.post('/did_it/:postId', async (req, res) => {
  console.log("inside did it Api");
  const post_id = req.params.postId;
  console.log(post_id);
  try {
    const foundPost = await Posts.findById(post_id);

    if (!foundPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    console.log("before foundPost");
    const foundDid = await did_it.findOne({ post_id: post_id, user_id: session.user_id });
    let updateDid;
    console.log("foundDid");
    console.log(foundDid);

    if (foundDid) {
      updateDid = foundPost.did - 1;
      await foundDid.deleteOne();
    } else {
      updateDid = foundPost.did + 1;
      const foundUser = await Users.findById(session.user_id);

      if (!foundUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const did_data = {
        post_id: post_id,
        user_id: session.user_id,
        first_name: foundUser.first_name,
        last_name: foundUser.last_name
      }

      const db = mongoose.connection;
      const results = await db.collection("did_it").insertOne(did_data);
    }

    const data = {
      did: updateDid
    };

    const updatedPost = await Posts.findByIdAndUpdate(post_id, data, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: "Can't update" });
    }

    return res.status(200).json({ message: 'Did it updated successfully', post: updatedPost, did: foundDid });
  } catch (error) {
    console.error(error); // log the error
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Connect to DB ----------
mongoose
  .connect(
    "mongodb+srv://AthletiLink:5q8ImIn@cluster0.ktoakuq.mongodb.net/AthletiLink?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`DB is Connected on port ${port}!`);
    });
  })
  .catch((error) => {
    console.log(error);
  });


