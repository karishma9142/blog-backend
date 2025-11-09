
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

async function Addblog() {
    const headline = document.getElementById("headline").value;
    const discripation = document.getElementById("discripation").value;
  
    try {
      const response = await axios.post(
        "http://localhost:3000/blog",
        {
          headline : headline,
          discripation : discripation
        },
        {
          headers: { token: localStorage.getItem("token") }
        }
      );
  
      alert(response.data.msg);
      await  ShowBlogs();
    } catch (error) {
      console.error("Error while adding blog:", error);
      alert("Failed to add blog. Please try again.");
    }
  }
  async function ShowBlogs() {
    try {
      const response = await axios.get(
        "http://localhost:3000/blogs",
        {
          headers: { token: localStorage.getItem("token") }
        }
      );
  
      console.log(response.data.blogs);
  
      const blogsList = document.getElementById("blogs-list");
      blogsList.innerHTML = response.data.blogs.map(b =>
        `<p>
          <strong>${b.headline}</strong> - ${b.discripation}
          <button onclick="update('${b._id}')">Update</button>
          <button onclick="Delete('${b._id}')">Delete</button>
        </p>`
      ).join("");
    } catch (error) {
      console.error("Error while fetching blogs:", error);
    }
  }
  
  function Delete(id) {
    axios.delete("http://localhost:3000/delete", {
      headers: {
        token: localStorage.getItem("token"),
        id: id
      }
    }).then(res => {
      alert(res.data.msg);
      ShowBlogs();
    }).catch(err => console.error("Error deleting:", err));
  }
  
  function update(id) {
    const newheadline = prompt("Enter new headline:");
    const newdiscripation = prompt("Enter new discripation:");
    axios.put("http://localhost:3000/update", {
      newheadline,
      newdiscripation
    }, {
      headers: {
        token: localStorage.getItem("token"),
        id: id
      }
    }).then(res => {
      alert(res.data.msg);
      ShowBlogs();
    }).catch(err => console.error("Error updating:", err));
  }
  