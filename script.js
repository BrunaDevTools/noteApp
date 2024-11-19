document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Página cargada correctamente");

    const containerInicio = document.querySelector('.container-inicio');
    const noteView = document.querySelector('.note-view');
    const addNoteButton = document.querySelector('.add-note');
    const notesContainer = document.querySelector('.notes-container');
    const categoriesContainer = document.querySelector('.categories');

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
    const noteDeleteButton = document.querySelector('.note-header .delete-button');

    // Obtengo los elementos para el setting de rename de categorias
    const selectCategoryDialog = document.getElementById('select-category-dialog');
    const categoryChecklist = document.getElementById('category-checklist');
    const selectCategoryConfirmButton = document.getElementById('select-category-confirm');
    const selectCategoryCancelButton = document.getElementById('select-category-cancel');
    const renameCategoryDialog = document.getElementById('rename-category-dialog');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const renameCategoryConfirmButton = document.getElementById('rename-category-confirm');
    const renameCategoryCancelButton = document.getElementById('rename-category-cancel');
    let categoryToRename = null;
    // Elementos del dialogo de eliminacion de categorias
    const deleteCategoryDialog = document.getElementById('delete-category-dialog');
    const deleteCategoryConfirmButton = document.getElementById('delete-category-confirm');
    const deleteCategoryCancelButton = document.getElementById('delete-category-cancel');
    let categoryToDelete = null;

    let notes = JSON.parse(localStorage.getItem('notes')) || []; // Array para almacenar las notas
    let categories = ['All', 'To do', 'Important', 'Ideas', 'Buy', 'Gym routine', 'Others'];
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
        const category = categoryButton.innerText.trim() === 'Category' ? 'Others' : categoryButton.innerText.trim();

        const noteData = {
            id: currentNoteId || generateUniqueId(),
            title: titleInput.value.trim(),
            category: category,
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
    function displayNotes(filteredCategory = 'All') {
        notesContainer.innerHTML = ''; // Limpiar el contenido antes de añadir las notas
        const notesToDisplay = filteredCategory === 'All' ? notes : notes.filter(note => note.category === filteredCategory);
       
        notesToDisplay.forEach((note) => {
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

    // Funcion para mostrar las categorias y añadir eventos click    
    function displayCategories() {
            categoriesContainer.innerHTML = '';
            categories.forEach((category) => {
                const categoryElement = document.createElement('button');
                categoryElement.classList.add('category-filter');
                categoryElement.setAttribute('data-category', category);
                categoryElement.innerText = category;
                categoriesContainer.appendChild(categoryElement);
    
                categoryElement.addEventListener('click', ()=> {
                    const activeCategory = document.querySelector('.category-filter.active');
                    if (activeCategory) {
                        activeCategory.classList.remove('active');
                    }
                    categoryElement.classList.add('active');
                    displayNotes(category);
                });
            });
        }

        displayCategories();
        displayNotes();
        updateCategoryMenu();

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

    // Funcion para actualizar el menu desplegable de categorias
    function updateCategoryMenu() {
        categoryMenu.innerHTML = '';
        categories.forEach(category => {
            if (category !== 'All' && category !== 'Others') {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-category', category);
                listItem.innerHTML = category;
                categoryMenu.appendChild(listItem);

                listItem.addEventListener('click', ()=> {
                    categoryButton.innerText = category;
                    categoryMenu.classList.remove('show');
                });
            }
        });
    }

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

    // Mostrar o esconder el menu de configuracion de las categorias
    document.querySelectorAll('.setting-btn-category').forEach((button)=> {
        button.addEventListener('click', ()=> {
            document.querySelectorAll('.setting-menu-options').forEach((menu)=> {
                menu.classList.toggle('show');
            });
        });
    });
    // Cerrar el menu cuando se hace click fuera de él
    window.addEventListener('click', (event)=> {
        const settingMenu = document.querySelectorAll('.setting-menu-options');
        const settingButton = document.querySelectorAll('.setting-btn-category');
        // Comprueba si el click fue fuera de cualquier boton y menu de configurar
        const clickedOutsideButton = ![...settingButton].some(button => button.contains(event.target));
        const clickedOutsideMenu = ![...settingMenu].some(menu => menu.contains(event.target));
        if (clickedOutsideButton && clickedOutsideMenu) {
            settingMenu.forEach((menu)=> {
                menu.classList.remove('show');
            });
        }
    });

    // Rename category
    // Mostrar el dialogo de seleccion cuando se hace click en "Rename category"
    document.querySelectorAll('.setting-option[data-category="rename-category"]').forEach(button => {
        button.addEventListener('click', ()=> {
            // Limpiar la lista de categorias
            categoryChecklist.innerHTML = '';

            // Agregar categorias a la lista de verificacion
            categories.forEach(category => {
                if (category !== 'All' && category !== 'Others') {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<input type="radio" name="category" value="${category}"> ${category}`;
                    categoryChecklist.appendChild(listItem);
                }
            });
            selectCategoryConfirmButton.setAttribute('data-action', 'rename'); // Indico que es para renombrar
            selectCategoryDialog.classList.remove('hidden');
        });
    });

    // Delete category
    // Mostrar el dialogo de seleccion cuando se hace click en "Delete category"
    document.querySelectorAll('.setting-option[data-category="delete-category"]').forEach(button => {
        button.addEventListener('click', ()=> {
            categoryChecklist.innerHTML = ''; // Limpio la lista de categorias
            // Agregar categorias a la lista de verificacion con la cantidad de notas asociadas
            categories.forEach(category => {
                if (category !== 'All' && category !== 'Others') {
                    const noteCount = notes.filter(note => note.category === category).length;
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<input type="radio" name="category" value="${category}"> ${category} (${noteCount} notes)`;
                    categoryChecklist.appendChild(listItem);
                }
            });
            selectCategoryConfirmButton.setAttribute('data-action', 'delete');
            selectCategoryDialog.classList.remove('hidden');
        });
    });

    // Confirmar seleccion de categoria para eliminar
    selectCategoryConfirmButton.addEventListener('click', () => {
        const selectedCategory = document.querySelector('input[name="category"]:checked');
        const action = selectCategoryConfirmButton.getAttribute('data-action');

        if (selectedCategory) {
            if (action === 'rename') {
                categoryToRename = selectedCategory.value;
                newCategoryNameInput.value = '';
                selectCategoryDialog.classList.add('hidden');
                renameCategoryDialog.classList.remove('hidden');
            } else if (action === 'delete') {
                categoryToDelete = selectedCategory.value;
                selectCategoryDialog.classList.add('hidden');
                deleteCategoryDialog.classList.remove('hidden');
            }
        } else {
            alert('Please select a category.');
        }
    });

    // Confirmar el cambio de nombre
    renameCategoryConfirmButton.addEventListener('click', ()=> {
        const newCategoryName = newCategoryNameInput.value.trim();
        if (newCategoryName === '' || categories.includes(newCategoryName)) {
            alert('Invalid category name or name already exists.');
            return;
        }
        // Actualizar la categoria en las notas
        notes = notes.map(note => {
            if (note.category === categoryToRename) {
                note.category = newCategoryName;
            }
            return note;
        });
        localStorage.setItem('notes', JSON.stringify(notes));

        // Actializar la lista de categorias
        categories = categories.map(category => category === categoryToRename ? newCategoryName : category);
        localStorage.setItem('categories', JSON.stringify(categories));

        // Si la categoria renombrada es la misma que la de la nota actual, actualizar el texto del boton de categorias
        if (categoryButton.innerText === categoryToRename) {
            categoryButton.innerText = newCategoryName;
        }

        // Actualizar la visualizacion de notas, categorias y menu desplegable de categorias
        displayNotes();
        displayCategories();
        updateCategoryMenu();

        categoryToRename = null;
        renameCategoryDialog.classList.add('hidden');
    });

    // Cancelar el cambio de nombre
    renameCategoryCancelButton.addEventListener('click', ()=> {
        categoryToRename = null;
        renameCategoryDialog.classList.add('hidden');
    });

    // Confirmar eliminacion de categoria
    deleteCategoryConfirmButton.addEventListener('click', ()=> {
        if (categoryToDelete) {
            // Eliminar todas las notas de la categoria excepto la nota actual
            notes = notes.filter(note => note.category !== categoryToDelete || note.id === currentNoteId); 
            localStorage.setItem('notes', JSON.stringify(notes));

            //Eliminar la categoria del array de categorias
            categories = categories.filter(category => category !== categoryToDelete);
            localStorage.setItem('categories', JSON.stringify(categories));

            // Si la categoria eliminada es la misma que la de la nota actual, actualizar el texto del boton de categorias
            if (categoryButton.innerText === categoryToDelete) {
                categoryButton.innerText = 'Others';

                //Actualizar la categoria de la nota actual a "Others"
                const note = notes.find(note => note.id === currentNoteId);
                if (note) {
                    note.category = 'Others';
                    localStorage.setItem('notes', JSON.stringify(notes));
                }
            }

            // Actualizar la visualizacion de notas, categorias y del menu desplegable de categorias
            displayNotes();
            displayCategories();
            updateCategoryMenu();

            categoryToDelete = null;
            deleteCategoryDialog.classList.add('hidden');
        }
    });

    // Cancelar la eliminacion de categoria
    deleteCategoryCancelButton.addEventListener('click', () => {
        categoryToDelete = null;
        deleteCategoryDialog.classList.add('hidden');
    });

    // Cancelar seleccion de categoria
    selectCategoryCancelButton.addEventListener('click', ()=> {
        selectCategoryDialog.classList.add('hidden');
    });

    //Seleccionar color para la nota
    //Evento para seleccionar el color (marcando solo el color elegido)
    colorButtons.forEach(button => {
        button.addEventListener("click", () => {
            colorButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            const color = button.getAttribute("data-color");
            noteView.style.backgroundColor = color; // Cambia el color de fondo
        });
    });

    
    displayCategories();
    displayNotes(); // Mostrar las notas al cargar la pagina
});