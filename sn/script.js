document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    initializeDarkMode();
});

const board = document.getElementById('board');
const addNoteBtn = document.getElementById('addNoteBtn');
const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');

addNoteBtn.addEventListener('click', addNote);
toggleDarkModeBtn.addEventListener('click', toggleDarkMode);

function addNote() {
    const note = createNoteElement();
    board.appendChild(note);
    saveNotes();
}

function createNoteElement(noteData = {}) {
    const note = document.createElement('div');
    note.classList.add('note');
    note.style.left = noteData.left || '10%';
    note.style.top = noteData.top || '10%';
    note.innerHTML = `
        <div class="note-header">
            <span></span>
            <button class="delete-btn">x</button>
        </div>
        <textarea>${noteData.text || ''}</textarea>
    `;

    const textarea = note.querySelector('textarea');
    textarea.addEventListener('blur', saveNotes);  // Save notes when textarea loses focus

    const deleteBtn = note.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        note.remove();
        saveNotes();
    });

    const header = note.querySelector('.note-header');
    header.addEventListener('mousedown', (event) => dragStart(event, note));
    header.addEventListener('touchstart', (event) => dragStart(event, note));

    return note;
}

function dragStart(event, note) {
    event.preventDefault();

    const startX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    const startY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
    const initialLeft = note.getBoundingClientRect().left - board.getBoundingClientRect().left;
    const initialTop = note.getBoundingClientRect().top - board.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        const boardRect = board.getBoundingClientRect();
        const newLeft = initialLeft + (pageX - startX);
        const newTop = initialTop + (pageY - startY);

        // Ensure the note does not go out of the board boundaries
        const minLeft = 0;
        const minTop = 50;  // Adjust this to match the height of your header if necessary
        const maxLeft = boardRect.width - note.offsetWidth;
        const maxTop = boardRect.height - note.offsetHeight;

        note.style.left = `${Math.max(minLeft, Math.min(newLeft, maxLeft))}px`;
        note.style.top = `${Math.max(minTop, Math.min(newTop, maxTop))}px`;
    }

    function onMouseMove(event) {
        const pageX = event.type === 'touchmove' ? event.touches[0].pageX : event.pageX;
        const pageY = event.type === 'touchmove' ? event.touches[0].pageY : event.pageY;
        moveAt(pageX, pageY);
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onMouseMove);
        document.removeEventListener('touchend', onMouseUp);

        // Save the note positions as percentages
        const boardRect = board.getBoundingClientRect();
        const leftPercentage = (parseFloat(note.style.left) / boardRect.width) * 100;
        const topPercentage = (parseFloat(note.style.top) / boardRect.height) * 100;

        note.style.left = `${leftPercentage}%`;
        note.style.top = `${topPercentage}%`;

        saveNotes();  // Save notes after dragging
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);
}

function saveNotes() {
    const notes = Array.from(document.querySelectorAll('.note')).map(note => ({
        text: note.querySelector('textarea').value,
        left: note.style.left,
        top: note.style.top
    }));

    fetch('save_note.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notes)
    }).then(response => response.json())
    .then(data => {
        if (data.status !== 'success') {
            console.error('Failed to save notes:', data.message);
        }
    });
}

function loadNotes() {
    fetch('load_notes.php')
        .then(response => response.json())
        .then(notes => {
            notes.forEach(noteData => {
                const note = createNoteElement(noteData);
                board.appendChild(note);
            });
        });
}

function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('light-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const darkMode = document.body.classList.contains('light-mode') ? 'enabled' : 'disabled';
    localStorage.setItem('darkMode', darkMode);
}
