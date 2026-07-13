// menu.js — sidebar open/close
function openMenu() {
    const side    = document.getElementById('Side');
    const sidebar = document.getElementById('Sidebar');
    const isOpen  = side.classList.contains('open');

    side.classList.toggle('open', !isOpen);
    sidebar.classList.toggle('open', !isOpen);
}

// Close when clicking outside the sidebar
document.addEventListener('click', function (e) {
    const side = document.getElementById('Side');
    if (side.classList.contains('open') && !side.contains(e.target)) {
        side.classList.remove('open');
        document.getElementById('Sidebar').classList.remove('open');
    }
});