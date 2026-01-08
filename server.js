const fs = require("fs");
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000; // or process.env.PORT || 3000

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true }));


// Homepage route
app.get("/", (req, res) => {
  res.render("home", {
    projects: require("./data/projects")
  }); // just render index.ejs, no data
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

});

// projects page route
app.get("/p/:slug", (req, res) => {
  const slug = req.params.slug;
  const filePath = `${__dirname}/data/projects/${slug}.json`;
  console.log("Trying to load JSON file:", filePath);

  try {
    const project = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Decode Base64 for any custom HTML blocks
    project.blocks.forEach(block => {
      if (block.type === "custom") {
        block.content = Buffer.from(block.content, 'base64').toString('utf-8');
      }
    });

    res.render("project", { project });
  } catch (err) {
    console.error("Error loading project JSON:", err);
    res.status(404).send("Project not found");
  }
});

//blog page route
app.get("/b/:slug", (req, res) => {
  const slug = req.params.slug;
  const filePath = `${__dirname}/data/blog/${slug}.json`;
  console.log("Trying to load JSON file:", filePath);

  try {
    const project = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Decode Base64 for any custom HTML blocks
    project.blocks.forEach(block => {
      if (block.type === "custom") {
        block.content = Buffer.from(block.content, 'base64').toString('utf-8');
      }
    });

    res.render("blog", { project });
  } catch (err) {
    console.error("Error loading project JSON:", err);
    res.status(404).send("Project not found");
  }
});

// index route
app.get("/index", (req, res) => {
  const projects = require("./data/projects");

  const tags = [...new Set(
    projects.flatMap(p => p.tags || [])
  )];

  res.render("index", {
    projects,
    tags
  });
});





app.get("/index", (req, res) => {
  
  const projects = require("./data/projects");
  const tagsQuery = req.query.tags; // "tag1,tag2"
  const activeTags = tagsQuery ? tagsQuery.split(",") : [];

  // Filter projects that contain at least one active tag
  const filteredProjects = activeTags.length
    ? projects.filter(p => p.tags.some(tag => activeTags.includes(tag)))
    : projects; // show all if no active tags

  res.render("index", { projects: filteredProjects, tags});
});



//admin

// Homepage route
app.get("/admin/projects", (req, res) => {
  res.render("admin/projects", {
    projects: require("./data/projects")
  }); // just render index.ejs, no data
});

// Admin – edit project (form)
app.get("/admin/projects/:slug/edit", (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, "data", "projects", `${slug}.json`);

  try {
    const project = JSON.parse(fs.readFileSync(filePath, "utf8"));
    project.slug = slug;

    res.render("admin/project-edit", { project });
  } catch (err) {
    console.error("Failed to load project:", err);
    res.status(404).send("Project not found");
  }
});

// Admin – save project
app.post("/admin/projects/:slug/edit", (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, "data", "projects", `${slug}.json`);

  try {
    const project = {
      title: req.body.title,
      headline: req.body.headline,
      description: req.body.description,
      hero_image: req.body.hero_image,
      tags: req.body.tags
        ? req.body.tags.split(",").map(t => t.trim())
        : []
    };

    // 👇 THIS GOES HERE
    project.blocks = req.body.blocks
      ? Object.values(req.body.blocks)
      : [];

    fs.writeFileSync(
      filePath,
      JSON.stringify(project, null, 2),
      "utf8"
    );

    res.redirect(`/admin/projects/${slug}/edit`);
  } catch (err) {
    console.error("Failed to save project:", err);
    res.status(500).send("Failed to save project");
  }
});
