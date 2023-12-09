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

app.use(express.static('assets'));
const port = 5500;

// ---------- File Upload ----------
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/images/profile-pictures');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ---------- Home Page - Redirect By Session  ----------
app.get("/", (req, res) => {

  if (session.user_id) {
    res.sendFile(__dirname + "/index.html");
  } else {
    res.redirect("signin.html");
  }
});

// ---------- Create User ----------
app.post("/user", upload.single('profilePicture'), async (req, res) => {
  try {
    const profilePicture = req.file ? `/assets/images/profile-pictures/${req.file.filename}` : null;

    var data = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      date: req.body.dob,
      profile_pic: profilePicture,
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
app.get("/user_session", async (res) => {
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
app.get("/user_details", async (res) => {
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
app.get("/getUsers", async (res) => {
  try {
    const users = await Users.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- Get All Users Groups By ID ----------
app.get("/user_groups/", async (res) => {
  try {
    const user_groups = await User_groups.find({
      user_id: session.user_id,
    });

    if (!user_groups) {
      return res.status(404).json({ message: "User not found" });
    }


    res.status(200).json({ user_groups });
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

// ---------- Get All Posts ----------
app.get("/posts", async (res) => {
  try {
    const posts = await Posts.find({});
    res.status(200).json({ posts });
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

// ---------- Get All Groups ----------
app.get("/groups", async (res) => {
  try {
    const groups = await Groups.find({});
    res.status(200).json({ groups });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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

// ---------- Get All Comments ----------
app.get("/comments", async (res) => {
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

    await comment.deleteOne();
    createLog("Delete Comment", `${comment_id}`, req);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
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

// ---------- Create Post ----------
app.post("/create_post", async (req, res) => {
  try {
    const user = await Users.findById(session.user_id);

    var data = {
      user_id: session.user_id,
      title: req.body.title,
      host: user.first_name + " " + user.last_name,
      duration: req.body.duration,
      lcoation: req.body.location,
      description: req.body.description,
      likes: 0,
      did: 0,
      comments: 0,
      group_name: req.body.group_name,
      date: req.body.date,
      time: req.body.time,
      status: "Pending"
    };

    var db = mongoose.connection;
    const result = await db.collection("posts").insertOne(data); // Use await to wait for the operation to complete
    const post_id = result.insertedId;
    createLog("Create Post", `${post_id}`, req, result);
    return res.redirect("http://127.0.0.1:5500/index.html");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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

// ---------- Like/Unlike Post - Not working ----------
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

//----------- Like API -------------
app.post('/like_posts/:postId', async (req, res) => {
  const post_id = req.params.postId;
  try {
    const foundPost = await Posts.findById(post_id);

    if (!foundPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    newLikes = foundPost.likes + 1;
    data = {
      likes: newLikes
    }

    const updatedPost = await Posts.findByIdAndUpdate(post_id, data, {
      new: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ message: "post not found" });
    }
    console.log(foundPost);
    return res.status(200).json({ message: 'Likes updated successfully', post: foundPost });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
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