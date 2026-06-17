const getNavFromPath = path => {
  const pageName = path.split('/').pop();
  const pageHash = window.location.hash.replace('#', '');

  if (pageName === 'index.html' && pageHash) {
    if (pageHash === 'about' || pageHash === 'contact' || pageHash === 'home') {
      return pageHash;
    }
  }

  if (pageName === 'about.html') {
    return 'about';
  }

  if (pageName === 'contact.html') {
    return 'contact';
  }

  return 'home';
};

window.getNavFromPath = getNavFromPath;

const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileNavPanel = document.querySelector('.mobile-nav-panel');

const setMobileNavOpen = isOpen => {
  if (!mobileNavToggle || !mobileNavPanel) {
    return;
  }

  mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
  mobileNavPanel.classList.toggle('is-open', isOpen);
  mobileNavPanel.setAttribute('aria-hidden', String(!isOpen));
};

mobileNavToggle?.addEventListener('click', () => {
  const isOpen = mobileNavPanel?.classList.contains('is-open') ?? false;
  setMobileNavOpen(!isOpen);
});

mobileNavPanel?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    setMobileNavOpen(false);
  });
});

const logWindowWidth = () => {
  console.log(`Window width: ${window.innerWidth}px`);
};

logWindowWidth();
window.addEventListener('resize', logWindowWidth);

