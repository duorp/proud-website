console.log("main.js loaded on", location.pathname, "saved:", localStorage.getItem("siteTheme"));

const STORAGE_KEY = "siteTheme";
const THEMES = {
  white: {
    c1: "#F9F9FF",
    c2: "#0D0D0D",
    c3: "#E56E38"
  },
  black: {
    c1: "#0D0D0D",
    c2: "#F9F9FF",
    c3: "#0045DA"
  },
  gray: {
    c1: "#C1C1C1",
    c2: "#181818",
    c3: "#95FF00"
  },
  random: {
    c1: "#325E48",
    c2: "#FBE4FF",
    c3: "#28FFBB"
  }
};
var accentColor = "#E56E38"

//api calls
fetch("https://api.github.com/repos/duorp/proud-website/commits?per_page=1")
  .then(r => r.json())
  .then(data => {
    const dateString = data[0].commit.author.date; 
    const date = new Date(dateString); 
    const formatted = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    document.getElementById("commit-date").textContent = formatted;
  });

fetch("https://api.weather.gov/gridpoints/OKX/37,39/forecast")
    .then(r => r.json())    
    .then(data => {
      const currentWeather = data.properties.periods[0].shortForecast;
      document.getElementById("weather").textContent = currentWeather;
    });

//DOM CONTENT LOADED
    document.addEventListener('DOMContentLoaded', () => {
      loadSavedTheme();
      //ADD HOVER STATES TO CHARACTERS
  
//FILTERING MECHANISM
  const activeTags = new Set(JSON.parse(localStorage.getItem('activeTags') || '[]'));

// Reset filters on homepage
if (window.location.pathname === '/') {
  activeTags.clear();
  localStorage.removeItem('activeTags');
}

  const cards = document.querySelectorAll('.card');
  const containers = [document.body]; 

  // Delegate clicks for all tags in containers
  containers.forEach(container => {
    container.addEventListener('click', e => {
      

      const tagEl = e.target.closest('.tag');
      if (!tagEl) return;

      const tag = tagEl.dataset.tag || tagEl.textContent.trim();

      // Toggle tag in Set
      activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);

      // Save to localStorage
      localStorage.setItem('activeTags', JSON.stringify([...activeTags]));

      // Update all tag elements with this tag
      document.querySelectorAll('.tag').forEach(el => {
        const elTag = el.dataset.tag || el.textContent.trim();
        el.classList.toggle('active', activeTags.has(elTag));
      
      });

      // Filter cards
      cards.forEach(card => {
        const cardTags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.trim());
        card.style.display = [...activeTags].some(tag => cardTags.includes(tag)) || activeTags.size === 0 ? '' : 'none';
      });
    });
  });

  // Initialize tags and filter on page load
  document.querySelectorAll('.tag').forEach(el => {
    const tag = el.dataset.tag || el.textContent.trim();
    if (activeTags.has(tag)) el.classList.add('active');
  });

  cards.forEach(card => {
    const cardTags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.trim());
    card.style.display = [...activeTags].some(tag => cardTags.includes(tag)) || activeTags.size === 0 ? '' : 'none';
  });

  const el = document.querySelector(".landing__text");
  el.innerHTML = wrapChars("Proud Taranat is a visual designer and hobbyist developer. She is passionate about telling human stories rooted in data.");

    document.addEventListener("mouseover", (e) => {
      const char = e.target.closest(".char");
      if (!char) return;
    
      char.classList.add("is-alt");
      char.style.color = accentColor;
    
      clearTimeout(char._fontTimer);
    
      char._fontTimer = setTimeout(() => {
        char.classList.remove("is-alt");
        char.style.color = ""; // revert to original color
      }, 2000);
    });


   // Apply saved theme on page load
  loadSavedTheme();

  // Add click listeners to all theme buttons
  document.querySelectorAll(".colors-container__colors").forEach(btn => {
    btn.addEventListener("click", () => {
      const themeName = btn.id;
      const theme = THEMES[themeName];
      if (!theme) return;

      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeName);
    });
  });

});

//CAROUSEL
var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1.2,
  loop: true,
  spaceBetween:10,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

//HELPER FUNCTIONS
    
function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 80%, 60%)`;
}

function wrapChars(text, wordClass = "word", charClass = "char") {
  return text
    .split(/(\s+)/) 
    .map(token => {
      if (/^\s+$/.test(token)) {
       
        return token
          .replace(/ /g, "&nbsp;")
          .replace(/\n/g, "<br>");
      }

      const chars = [...token]
        .map(ch => `<span class="${charClass}">${ch}</span>`)
        .join("");

      return `<span class="${wordClass}">${chars}</span>`;
    })
    .join("");
}

//COLOR PALETTES

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--white", theme.c1);
  root.style.setProperty("--black", theme.c2);
  root.style.setProperty("--accent", theme.c3);
  accentColor = theme.c3;
}

function loadSavedTheme() {
  console.log("running")
  const savedName = localStorage.getItem(STORAGE_KEY);
  if (savedName && THEMES[savedName]) {
    applyTheme(THEMES[savedName]);
  }
}

