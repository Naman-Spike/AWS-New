const newsEl = document.getElementById("news");
const menuEl = document.getElementById("menu");
const searchEl = document.getElementById("search");
const emptyEl = document.getElementById("empty");
const todayEl = document.getElementById("today");

let articles = [];
let activeCategory = "All";

todayEl.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

function getText(node, tag) {
  const el = node.getElementsByTagName(tag)[0];
  return el ? el.textContent.trim() : "";
}

function parseXML(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const nodes = Array.from(doc.getElementsByTagName("article"));
  return nodes.map(function (n) {
    return {
      id: getText(n, "id"),
      category: getText(n, "category"),
      title: getText(n, "title"),
      summary: getText(n, "summary"),
      date: getText(n, "date"),
      author: getText(n, "author")
    };
  });
}

function buildMenu() {
  const categories = ["All"].concat(
    Array.from(new Set(articles.map(function (a) { return a.category; })))
  );
  menuEl.innerHTML = "";
  categories.forEach(function (cat) {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if (cat === activeCategory) btn.classList.add("active");
    btn.addEventListener("click", function () {
      activeCategory = cat;
      buildMenu();
      render();
    });
    menuEl.appendChild(btn);
  });
}

function render() {
  const query = searchEl.value.trim().toLowerCase();
  const list = articles.filter(function (a) {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchText =
      a.title.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query);
    return matchCat && matchText;
  });

  newsEl.innerHTML = "";
  emptyEl.hidden = list.length > 0;

  list.forEach(function (a) {
    const card = document.createElement("article");
    card.className = "article";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = a.category;

    const title = document.createElement("h2");
    title.textContent = a.title;

    const summary = document.createElement("p");
    summary.textContent = a.summary;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = a.author + " | " + a.date;

    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(meta);
    newsEl.appendChild(card);
  });
}

searchEl.addEventListener("input", render);

fetch("news.xml")
  .then(function (res) {
    if (!res.ok) throw new Error("Could not load news.xml");
    return res.text();
  })
  .then(function (text) {
    articles = parseXML(text);
    buildMenu();
    render();
  })
  .catch(function () {
    newsEl.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.textContent = "Could not load news. Run the page from a local server.";
  });
