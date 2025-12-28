
function moveToSignin() {
    document.getElementById("signup-container").style.display = "none";
    document.getElementById("signin-container").style.display = "block";
    document.getElementById("blog-container").style.display = "none";
}

function moveToSignup() {
    document.getElementById("signup-container").style.display = "block";
    document.getElementById("signin-container").style.display = "none";
    document.getElementById("blog-container").style.display = "none";
}

function showBlogs() {
    document.getElementById("signup-container").style.display = "none";
    document.getElementById("signin-container").style.display = "none";
    document.getElementById("blog-container").style.display = "block";
}
async function signup() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        const response = await axios.post("http://localhost:3000/signup", {
            email,
            password,
        });
        alert(response.data.msg);
        moveToSignin();
    } catch (error) {
        console.error("Error while signing up:", error);
    }
}

async function signin() {
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
        const response = await axios.post("http://localhost:3000/signin", {
            email : email,
            password : password
        });
        localStorage.setItem("token", response.data.token);
        alert(response.data.msg);
        showBlogs();
        await  ShowBlogs();
    } catch (error) {
        console.error("Error while signing in:", error);
    }
}

// ---------------- ADD BLOG ----------------
async function Addblog() {
  const headline = document.getElementById("headline").value;
  const discripation = document.getElementById("discripation").value;
  const imageFile = document.getElementById("image").files[0];

  if (!imageFile) {
    alert("NO IMAGE SELECTED");
    return;
  }

  const formData = new FormData();
  formData.append("headline", headline);
  formData.append("discripation", discripation);
  formData.append("image", imageFile); // 🔥 MUST BE "image"

  try {
    const res = await axios.post(
      "http://localhost:3000/blog",
      formData,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );

    alert(res.data.msg);
    ShowBlogs();
  } catch (err) {
    console.error(err);
    alert("FAILED");
  }
}


// ---------------- SHOW BLOGS ----------------
async function ShowBlogs() {
  try {
    const response = await axios.get(
      "http://localhost:3000/blogs",
      {
        headers: { token: localStorage.getItem("token") },
      }
    );

    const blogs = response.data.blogs;
    const blogsList = document.getElementById("blogs-list");

    blogsList.innerHTML = "";

    blogs.forEach((b) => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";

      div.innerHTML = `
        <h3>${b.headline}</h3>
        <p>${b.discripation}</p>

        ${b.image ? `<img src="${b.image}" width="200" />` : ""}

        <br/><br/>
        <button onclick="updateBlog('${b._id}')">Update</button>
        <button onclick="DeleteBlog('${b._id}')">Delete</button>
      `;

      blogsList.appendChild(div);
    });
  } catch (error) {
    console.error("Fetch blogs error:", error);
  }
}

// ---------------- DELETE BLOG ----------------
async function DeleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog?")) return;

  try {
    await axios.delete("http://localhost:3000/delete", {
      headers: {
        token: localStorage.getItem("token"),
        id: id,
      },
    });

    ShowBlogs();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete blog");
  }
}

// ---------------- UPDATE BLOG (TEXT ONLY) ----------------
async function updateBlog(id) {
  const newheadline = prompt("Enter new headline:");
  const newdiscripation = prompt("Enter new description:");

  if (!newheadline || !newdiscripation) return;

  try {
    await axios.put(
      "http://localhost:3000/update",
      {
        newheadline,
        newdiscripation,
      },
      {
        headers: {
          token: localStorage.getItem("token"),
          id: id,
        },
      }
    );

    ShowBlogs();
  } catch (error) {
    console.error("Update error:", error);
    alert("Failed to update blog");
  }
}
