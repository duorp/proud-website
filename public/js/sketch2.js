function wrapChars(text, wordClass = "word", charClass = "char") {
    return text
      .split(/(\s+)/) // keep spaces as tokens
      .map(token => {
        if (/^\s+$/.test(token)) {
          // preserve spaces/newlines
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
  

const el = document.querySelector(".landing__text");
el.innerHTML = wrapChars("Proud Taranat is a visual designer and hobbyist developer. She is passionate about telling human stories rooted in data.");


function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 60%)`;
  }
  
  document.addEventListener("mouseover", (e) => {
    const char = e.target.closest(".char");
    if (!char) return;
  
    char.classList.add("is-alt");
    char.style.color = randomColor();
  
    clearTimeout(char._fontTimer);
  
    char._fontTimer = setTimeout(() => {
      char.classList.remove("is-alt");
      char.style.color = ""; // revert to original color
    }, 2000);
  });
  