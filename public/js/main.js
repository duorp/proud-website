document.addEventListener('DOMContentLoaded', () => {
  const activeTags = new Set(JSON.parse(localStorage.getItem('activeTags') || '[]'));

// Reset filters on homepage
if (window.location.pathname === '/') {
  activeTags.clear();
  localStorage.removeItem('activeTags');
}

  const cards = document.querySelectorAll('.card');
  const containers = [document.body]; // all areas where tags exist

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
});
