document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Página cargada correctamente");

    const containerInicio = document.querySelector('.container-inicio');
    const noteView = document.querySelector('.note-view');
    const addNoteButton = document.querySelector('.add-note');
    const notesContainer = document.querySelector('.notes-container');

    // Obtengo los elementos de note-view y del formulario
    const backButton = document.querySelector('.back-button');
    const titleInput = document.getElementById('note-title-input');
    const categoryButton = document.querySelector('.category-button');
    const categoryMenu = document.getElementById('category-menu');
    const categoryItems = document.querySelectorAll('.category-menu li');
    const colorButtons = document.querySelectorAll('.color-button');
    const textArea = document.getElementById('note-text-area');

    const confirmDialog = document.getElementById('confirm-dialog');
    const confirmYesButton = document.getElementById('confirm-yes');
    const confirmNoButton = document.getElementById('confirm-no');
    const noteDeleteButton = document.querySelector('.note-header .delete-button')

    // Array para almacenar las notas
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let noteToDeleteId = null;
    let currentNoteId = null; // ID de la nota actual

    // Esconder la vista de la nota al cargar la pagina
    containerInicio.style.display = 'flex';
    noteView.style.display = 'none';

    // Funcion para abrir la vista de la nota
    function openNoteView() {
        containerInicio.style.display = 'none';
        noteView.style.display = 'flex';
    }

    // Funcion para regresar a la pagina de inicio y guardar la nota
    function closeNoteView() {
        if(isNoteModified()){
            saveNoteData();
        }
        containerInicio.style.display = 'flex';
        noteView.style.display = 'none';
        displayNotes(); // Mostrar las notas actualizadas
        currentNoteId = null; // Resetear el ID de la nota actual
    }

    function generateUniqueId(){
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Funcion para guardar los datos de la nota
    function saveNoteData() {
        const noteData = {
            id: currentNoteId || generateUniqueId(),
            title: titleInput.value.trim(),
            category: categoryButton.innerText.trim(),
            color: getSelectedColor(),
            content: textArea.value.trim(),
            date: new Date().toLocaleDateString(),
        };

        if(noteData.title !== '' || noteData.content !== '') {
            if(currentNoteId !== null) {
                const index = notes.findIndex(note => note.id === currentNoteId);
                notes[index] = noteData // Actualiza la nota existente
            } else {
                notes.unshift(noteData); // Añadir nota nueva
            }
            localStorage.setItem("notes", JSON.stringify(notes));
        }
    }

    function isNoteModified() {
        return titleInput.value.trim() !== '' || textArea.value.trim() !== '';
    }

    // Funcion para mostrar las notas en la pagina de inicio
    function displayNotes() {
        notesContainer.innerHTML = ''; // Limpiar el contenido antes de añadir las notas
        notes.forEach((note) => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.style.backgroundColor = note.color;
            noteElement.innerHTML = `
            <div class="note-content">  
                    <h3 class="note-name">${note.title}</h3>
                    <p class="note-date">Last modified: <span class="modification-date">${note.date}</span></p>
                  </div>
                  <button class="delete-button" aria-label="Delete note" data-id="${note.id}">
                    <img src="icons/delete.svg" alt="Delete">
                  </button>
                  `;
                  notesContainer.appendChild(noteElement);

                  // Evento para abrir la nota al hacer click en la nota
                  noteElement.addEventListener('click', () => {
                    openExistingNote(note.id);
                  });

                  // Evento para eliminar la nota al hacer click en el icono basurero
                  noteElement.querySelector('.delete-button').addEventListener('click', (event)=> {
                    event.stopPropagation();
                    noteToDeleteId = note.id;
                    confirmDialog.classList.remove('hidden');
                  });
            });
        }

        // Evento para eliminar la nota desde la vista de la nota
        noteDeleteButton.addEventListener('click', () => {
            noteToDeleteId = currentNoteId;
            confirmDialog.classList.remove('hidden');
        });

    // Funcion para eliminar la nota confirmada
    confirmYesButton.addEventListener('click', ()=> {
        if(noteToDeleteId !== null) {
            const index = notes.findIndex(note => note.id === noteToDeleteId);
            if (index !== -1) {
                notes.splice(index, 1);
                localStorage.setItem("notes", JSON.stringify(notes));
                displayNotes();
                noteToDeleteId = null;
                if (containerInicio.style.display === 'none') {
                    closeNoteView();
                    }
                }
            }
            confirmDialog.classList.add('hidden');
    });

    // Funcion para cancelar la eliminacion de la nota
    confirmNoButton.addEventListener('click', ()=> {
        noteToDeleteId = null;
        confirmDialog.classList.add('hidden');
    });

    // Funcion para abrir una nota existente
    function openExistingNote(id) {
        const note = notes.find(note => note.id === id);
        if (note) {
        titleInput.value = note.title;
        categoryButton.innerText = note.category;
        setSelectedColor(note.color);
        textArea.value = note.content;
        noteView.style.backgroundColor = note.color;
        // Mover la nota al principio del array
        const index = notes.findIndex(note => note.id === id);
        if (index !== -1) {
            notes.splice(index, 1);
            notes.unshift(note);
            localStorage.setItem("notes", JSON.stringify(notes));
        }
        currentNoteId = id; // Establecer el ID de la nota actual
        openNoteView();
        } else {
            alert('Note not found or has been deleted.');
        }
    }

    // Funcion auxiliar para obtener el color seleccionado
    function getSelectedColor() {
        let selectedColor = "";
        colorButtons.forEach(button => {
            if (button.classList.contains("selected")) {
                selectedColor = button.getAttribute("data-color");
            }
        });
        return selectedColor;
    }

    // Funcion auxiliar para aplicar el color guardado
    function setSelectedColor(color) {
        colorButtons.forEach(button => {
            if (button.getAttribute("data-color") === color) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
        noteView.style.backgroundColor = color;
    }

    // Funcion para resetear el formulario de la nota
    function resetForm() {
        titleInput.value = '';
        categoryButton.innerText = 'Category';
        colorButtons.forEach(button => button.classList.remove("selected"));
        textArea.value = '';
        noteView.style.backgroundColor = '';
        currentNoteId = null; // Reseteo el ID de la nota
    }

    // Evento para el boton "add-note" que abre la vista de nota
    addNoteButton.addEventListener('click', ()=> {
        resetForm();
        currentNoteId = null; // Aseguro que no estoy editando una nota existente
        openNoteView();
    });

    // Evento para el boton "back-button" que guarda y cierra la vista de nota
    backButton.addEventListener('click', closeNoteView);

    // Evento para desplegar el menu de categorias
    categoryButton.addEventListener('click', () => {
        categoryMenu.classList.toggle("show");
    });

    // Evento para seleccionar una categoria
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryButton.innerText = item.innerText;
            categoryMenu.classList.remove('show');
        });
    });

    //Evento para seleccionar el color (marcando solo el color elegido)
    colorButtons.forEach(button => {
        button.addEventListener("click", () => {
            colorButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            const color = button.getAttribute("data-color");
            noteView.style.backgroundColor = color; // Cambia el color de fondo
        });
    });

    // Mostrar las notas al cargar la pagina
    displayNotes();
});