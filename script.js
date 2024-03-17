document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const searchBookForm = document.getElementById("searchBook");
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  const bookSubmitButton = document.getElementById("bookSubmit");

  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  const inputBookIsCompleteCheckbox = document.getElementById(
    "inputBookIsComplete"
  );
  inputBookIsCompleteCheckbox.addEventListener("change", function () {
    updateSubmitButtonText();
  });

  function createBookElement(book) {
    const article = document.createElement("article");
    article.className = "book_item";
    article.id = `book_${book.id}`; // Menetapkan ID berdasarkan ID buku
    article.dataset.bookId = book.id; // Menambahkan dataset dengan ID buku
    article.innerHTML = `
        <h3>${book.title}</h3>
        <p>Penulis: ${book.author}</p>
        <p>Tahun: ${book.year}</p>
        
        <div class="action">
            <button class="green" onclick="toggleComplete(${book.id})">
              ${book.isComplete ? "Belum Selesai Dibaca" : "Selesai Dibaca"}
            </button>
            <button class="blue" data-book-id="${
              book.id
            }" data-action="edit">Edit buku</button>
            <button class="red" onclick="deleteBook(${
              book.id
            })">Hapus buku</button>
        </div>
    `;

    // Menambahkan event listener untuk semua tombol di dalam article
    const toggleButton = article.querySelector(".green");
    toggleButton.addEventListener("click", function () {
      if (book.isComplete) {
        toggleComplete(book.id);
        displayBooks();
      } else {
        moveToComplete(book.id);
        displayBooks();
      }
    });
    const editButton = article.querySelector(".blue");
    editButton.addEventListener("click", function () {
      editBook(book.id);
    });
    const deleteButton = article.querySelector(".red");
    deleteButton.addEventListener("click", function () {
      deleteBook(book.id);
    });

    return article;
  }

  function displayBooks() {
    const incompleteBooks = getBooks(false);
    const completeBooks = getBooks(true);

    displayBookshelf(incompleteBooks, incompleteBookshelfList);
    displayBookshelf(completeBooks, completeBookshelfList);
  }

  function displayBookshelf(books, shelf) {
    shelf.innerHTML = "";
    books.forEach((book) => {
      const bookElement = createBookElement(book);
      shelf.appendChild(bookElement);
    });
  }

  function getBooks(isComplete) {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    return books.filter((book) => book.isComplete === isComplete);
  }

  function saveBooks(books) {
    localStorage.setItem("books", JSON.stringify(books));
  }

  function addBook() {
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = parseInt(document.getElementById("inputBookYear").value);
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    const newBook = {
      id: +new Date(),
      title,
      author,
      year,
      isComplete,
    };

    const books = JSON.parse(localStorage.getItem("books")) || [];
    books.push(newBook);
    saveBooks(books);

    displayBooks();
    inputBookForm.reset();
  }

  function updateSubmitButtonText() {
    const isCompleteCheckbox = document.getElementById("inputBookIsComplete");
    const buttonText = isCompleteCheckbox.checked
      ? "Masukkan Buku ke rak Selesai Dibaca"
      : "Masukkan Buku ke rak Belum Selesai Dibaca";
    bookSubmitButton.innerText = buttonText;
  }

  function editBook(bookId) {
    console.log("Edit button clicked for book with ID:", bookId);
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const bookIndex = books.findIndex((book) => book.id === bookId);

    if (bookIndex !== -1) {
      const bookToEdit = books[bookIndex];
      // Display the popup menu to edit the book
      showEditPopup(bookToEdit);
    }
  }

  function showEditPopup(book) {
    if (!book) return;

    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");

    const popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");

    const editForm = document.createElement("form");
    editForm.id = "editBookForm";

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Judul:";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = book.title;
    titleInput.id = "editBookTitle";

    const authorLabel = document.createElement("label");
    authorLabel.textContent = "Penulis:";
    const authorInput = document.createElement("input");
    authorInput.type = "text";
    authorInput.value = book.author;
    authorInput.id = "editBookAuthor";

    const yearLabel = document.createElement("label");
    yearLabel.textContent = "Tahun:";
    const yearInput = document.createElement("input");
    yearInput.type = "number";
    yearInput.value = book.year;
    yearInput.id = "editBookYear";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Simpan";
    saveButton.type = "submit";

    editForm.addEventListener("submit", function (event) {
      event.preventDefault();
      saveEditedBook(book);
      closePopup();
    });

    // Menutup popup ketika klik di luar popup
    popupContainer.addEventListener("click", function (event) {
      if (!popupContent.contains(event.target)) {
        closePopup();
      }
    });

    editForm.appendChild(titleLabel);
    editForm.appendChild(titleInput);
    editForm.appendChild(authorLabel);
    editForm.appendChild(authorInput);
    editForm.appendChild(yearLabel);
    editForm.appendChild(yearInput);
    editForm.appendChild(saveButton);

    popupContent.appendChild(editForm);
    popupContainer.appendChild(popupContent);

    document.body.appendChild(popupContainer);
    document.body.classList.add("overlay");
  }
  function closePopup() {
    const popupContainer = document.querySelector(".popup-container");
    if (popupContainer) {
      popupContainer.remove();
      document.body.classList.remove("overlay");
    }
  }
  function saveEditedBook(book) {
    const editedTitle = document.getElementById("editBookTitle").value;
    const editedAuthor = document.getElementById("editBookAuthor").value;
    const editedYear = parseInt(document.getElementById("editBookYear").value);

    // Find the index of the edited book in the array
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const index = books.findIndex((b) => b.id === book.id);

    // If the book is found, update its properties
    if (index !== -1) {
      books[index].title = editedTitle;
      books[index].author = editedAuthor;
      books[index].year = editedYear;
      saveBooks(books); // Save the updated array back to localStorage
      displayBooks(); // Refresh the displayed books
    }

    closePopup(); // Close the popup after saving
  }

  function toggleComplete(bookId) {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const bookIndex = books.findIndex((book) => book.id === bookId);

    if (bookIndex !== -1) {
      books[bookIndex].isComplete = !books[bookIndex].isComplete;
      saveBooks(books);
      displayBooks();
    }
  }

  function moveToComplete(bookId) {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const bookIndex = books.findIndex((book) => book.id === bookId);

    if (bookIndex !== -1) {
      books[bookIndex].isComplete = true;
      saveBooks(books);
      displayBooks();
    }
  }

  function deleteBook(bookId) {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const updatedBooks = books.filter((book) => book.id !== bookId);
    saveBooks(updatedBooks);
    displayBooks();
  }

  function searchBook() {
    const searchTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    const books = JSON.parse(localStorage.getItem("books")) || [];

    const filteredIncompleteBooks = books.filter(
      (book) =>
        !book.isComplete && book.title.toLowerCase().includes(searchTitle)
    );
    const filteredCompleteBooks = books.filter(
      (book) =>
        book.isComplete && book.title.toLowerCase().includes(searchTitle)
    );

    displayBookshelf(filteredIncompleteBooks, incompleteBookshelfList);
    displayBookshelf(filteredCompleteBooks, completeBookshelfList);
  }

  function updateSubmitButtonText() {
    const isCompleteCheckbox = document.getElementById("inputBookIsComplete");
    const buttonText = isCompleteCheckbox.checked
      ? "Masukkan Buku ke rak Selesai Dibaca"
      : "Masukkan Buku ke rak Belum Selesai Dibaca";
    bookSubmitButton.innerText = buttonText;
  }

  displayBooks();
});
