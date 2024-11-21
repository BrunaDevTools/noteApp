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
    // Elementos del dialogo de agregar categorias - add category
    const addCategoryButton = document.querySelectorAll('.setting-option[data-category="add-category"]');
    const addCategoryDialog = document.getElementById('add-category-dialog');
    const newAddCategoryNameInput = document.getElementById('new-category-name-input');
    const addCategoryConfirmButton = document.getElementById('add-category-confirm');
    const addCategoryCancelButton = document.getElementById('add-category-cancel');

    let notes = JSON.parse(localStorage.getItem('notes')) || []; // Array para almacenar las notas
    let categories = JSON.parse(localStorage.getItem('categories')) || ['All', 'To do', 'Important', 'Ideas', 'Buy', 'Gym routine', 'Others'];
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

    // Function to display notes on the home page
    function displayNotes(filteredCategory = 'All') {
        notesContainer.innerHTML = ''; // Clear existing notes
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

                  // Event to open the note on click
                  noteElement.addEventListener('click', () => {
                    openExistingNote(note.id);
                  });

                  // Event to delete the note on click of the trash icon
                  noteElement.querySelector('.delete-button').addEventListener('click', (event)=> {
                    event.stopPropagation();
                    noteToDeleteId = note.id;
                    confirmDialog.classList.remove('hidden');
                  });
            });
        }

    // Function to display categories and add click events    
    function displayCategories() {
        // Filter and sort categories alphabetically, placing "All" and "Others" at the top
            let orderedCategories = categories.filter(cat => cat !== 'All' && cat !== 'Others').sort();
            orderedCategories.unshift('Others');
            orderedCategories.unshift('All');

            const categoriesContainer = document.querySelector('.categories');
            categoriesContainer.innerHTML = '';
            orderedCategories.forEach(category => {
                const categoryElement = document.createElement('button');
                categoryElement.classList.add('category-filter');
                categoryElement.setAttribute('data-category', category);
                categoryElement.innerText = category;
                categoriesContainer.appendChild(categoryElement);
                
                // Event to filter notes by category on click
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

        // Event to delete the note from the note view
        noteDeleteButton.addEventListener('click', () => {
            noteToDeleteId = currentNoteId;
            confirmDialog.classList.remove('hidden');
        });

    // Function to delete the confirm note
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

    // Function to cancel note deletion
    confirmNoButton.addEventListener('click', ()=> {
        noteToDeleteId = null;
        confirmDialog.classList.add('hidden');
    });

    // Function to open an existing note
    function openExistingNote(id) {
        const note = notes.find(note => note.id === id);
        if (note) {
        titleInput.value = note.title;
        categoryButton.innerText = note.category;
        setSelectedColor(note.color);
        textArea.value = note.content;
        noteView.style.backgroundColor = note.color;
        // Move the note to the beginning of the array
        const index = notes.findIndex(note => note.id === id);
        if (index !== -1) {
            notes.splice(index, 1);
            notes.unshift(note);
            localStorage.setItem("notes", JSON.stringify(notes));
        }
        currentNoteId = id; // Set the current note ID
        openNoteView();
        } else {
            alert('Note not found or has been deleted.');
        }
    }

    // Helper function to get selected color
    function getSelectedColor() {
        let selectedColor = "";
        colorButtons.forEach(button => {
            if (button.classList.contains("selected")) {
                selectedColor = button.getAttribute("data-color");
            }
        });
        return selectedColor;
    }

    // Helper function to apply the saved color
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

    // Function to reset the note form
    function resetForm() {
        titleInput.value = '';
        categoryButton.innerText = 'Category';
        colorButtons.forEach(button => button.classList.remove("selected"));
        textArea.value = '';
        noteView.style.backgroundColor = '';
        currentNoteId = null; // Reset the current note ID
    }

    // Event for "add-note" button to opne the note view
    addNoteButton.addEventListener('click', ()=> {
        resetForm();
        currentNoteId = null; // Ensure we're not editing an existing note
        openNoteView();
    });

    // Event for "back-button" to save and close the note view
    backButton.addEventListener('click', closeNoteView);

    // Function to update the category dropdown menu
    function updateCategoryMenu() {
       const orderedCategories = categories.filter(cat => cat !== 'All' && cat !== 'Others').sort();
       orderedCategories.unshift('Others');
       orderedCategories.unshift('All');

       categoryMenu.innerHTML = '';
       orderedCategories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-category', category);
        listItem.innerHTML = category;
        categoryMenu.appendChild(listItem);
        // Event to select a category from the dropdown
        listItem.addEventListener('click', ()=> {
            categoryButton.innerText = category;
            categoryMenu.classList.remove('show');
        });
       });
    }

    // Event to toggle the category dropdown menu
    categoryButton.addEventListener('click', () => {
        categoryMenu.classList.toggle("show");
    });

    // Event to select a category from the items
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryButton.innerText = item.innerText;
            categoryMenu.classList.remove('show');
        });
    });

    // Show or hide the category setting menu
    document.querySelectorAll('.setting-btn-category').forEach((button)=> {
        button.addEventListener('click', ()=> {
            document.querySelectorAll('.setting-menu-options').forEach((menu)=> {
                menu.classList.toggle('show');
            });
        });
    });
    // Close the menu when clicking outside of it
    window.addEventListener('click', (event)=> {
        const settingMenu = document.querySelectorAll('.setting-menu-options');
        const settingButton = document.querySelectorAll('.setting-btn-category');
        // Check if the click was outside of any setting button and menu
        const clickedOutsideButton = ![...settingButton].some(button => button.contains(event.target));
        const clickedOutsideMenu = ![...settingMenu].some(menu => menu.contains(event.target));
        if (clickedOutsideButton && clickedOutsideMenu) {
            settingMenu.forEach((menu)=> {
                menu.classList.remove('show');
            });
        }
    });

    // Rename category
    // Show the selection dialog when clicking on "Rename category"
    document.querySelectorAll('.setting-option[data-category="rename-category"]').forEach(button => {
        button.addEventListener('click', ()=> {
            // Clear the category checklist
            categoryChecklist.innerHTML = '';

            // Add categories to the checklist
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
    // Show the selection dialog when clicking on "Delete category"
    document.querySelectorAll('.setting-option[data-category="delete-category"]').forEach(button => {
        button.addEventListener('click', ()=> {
            categoryChecklist.innerHTML = ''; // Clear the category checklist
            // Add categories to the checklist with the number of associated
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

    // Confirm category selection for renaming or deleting
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

    // Confirm category rename
    renameCategoryConfirmButton.addEventListener('click', ()=> {
        const newCategoryName = newCategoryNameInput.value.trim();
        if (newCategoryName === '' || categories.includes(newCategoryName)) {
            alert('Invalid category name or name already exists.');
            return;
        }
        // Update category in notes
        notes = notes.map(note => {
            if (note.category === categoryToRename) {
                note.category = newCategoryName;
            }
            return note;
        });
        localStorage.setItem('notes', JSON.stringify(notes));

        // Update category list
        categories = categories.map(category => category === categoryToRename ? newCategoryName : category);
        localStorage.setItem('categories', JSON.stringify(categories));

        // If the renamed category is the same as the current note category, update the category button text
        if (categoryButton.innerText === categoryToRename) {
            categoryButton.innerText = newCategoryName;
        }

        // Update note, category, and category menu display
        displayNotes();
        displayCategories();
        updateCategoryMenu();

        categoryToRename = null;
        renameCategoryDialog.classList.add('hidden');
    });

    // Cancel category rename
    renameCategoryCancelButton.addEventListener('click', ()=> {
        categoryToRename = null;
        renameCategoryDialog.classList.add('hidden');
    });

    // Confirm category deletion
    deleteCategoryConfirmButton.addEventListener('click', ()=> {
        if (categoryToDelete) {
            // Delet all notes in the category except the current note
            notes = notes.filter(note => note.category !== categoryToDelete || note.id === currentNoteId); 
            localStorage.setItem('notes', JSON.stringify(notes));

            // Remove category from category array
            categories = categories.filter(category => category !== categoryToDelete);
            localStorage.setItem('categories', JSON.stringify(categories));

            // If the deleted category is the same as the current note category, update the category button text
            if (categoryButton.innerText === categoryToDelete) {
                categoryButton.innerText = 'Others';

                // Update the current note's category to "Others"
                const note = notes.find(note => note.id === currentNoteId);
                if (note) {
                    note.category = 'Others';
                    localStorage.setItem('notes', JSON.stringify(notes));
                }
            }

            // Update note, category, and category menu display
            displayNotes();
            displayCategories();
            updateCategoryMenu();

            categoryToDelete = null;
            deleteCategoryDialog.classList.add('hidden');
        }
    });

    // Cancel category deletion
    deleteCategoryCancelButton.addEventListener('click', () => {
        categoryToDelete = null;
        deleteCategoryDialog.classList.add('hidden');
    });

    // Cancel category selection
    selectCategoryCancelButton.addEventListener('click', ()=> {
        selectCategoryDialog.classList.add('hidden');
    });

    // Add category--- 
    // Show the add category dialog
    addCategoryButton.forEach(button => {
        button.addEventListener('click', ()=> {
            newAddCategoryNameInput.value = '';
            addCategoryDialog.classList.remove('hidden');
        });
    });

    // Confirm adding a new category
    addCategoryConfirmButton.addEventListener('click', ()=> {
        const newCategoryName = newAddCategoryNameInput.value.trim();
        if (newCategoryName === '' || categories.includes(newCategoryName)){
            alert('Invalid category name or name already exists.');
            return;
        }
        // Add a new category to the category list
        categories.push(newCategoryName);
        localStorage.setItem('categories', JSON.stringify(categories));

        // Update the category button text if it's a new note
        categoryButton.innerText = newCategoryName;

        // Update category display
        displayCategories();
        updateCategoryMenu();

        addCategoryDialog.classList.add('hidden');
    });

    // Cancel adding new category
    addCategoryCancelButton.addEventListener('click', ()=> {
        addCategoryDialog.classList.add('hidden');
    });

    // Select color for the note
    // Event to select the color (marking only the chosen color)
    colorButtons.forEach(button => {
        button.addEventListener("click", () => {
            colorButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            const color = button.getAttribute("data-color");
            noteView.style.backgroundColor = color; // Change the background color
        });
    });

    
    displayCategories();
    displayNotes(); 
    updateCategoryMenu();
});