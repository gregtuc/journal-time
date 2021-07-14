const { writeJournal, getJournals, getEncryptedJournals, extensionTrimmer, journalsExist } = require('./journalLoader');
var storedPassword = "";

window.addEventListener('DOMContentLoaded', () => {

  function createElements() {
    var titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Journal Title";
    titleInput.id = "journal-title";

    var bodyInput = document.createElement("textarea");
    bodyInput.placeholder = "Your Journal";
    bodyInput.id = "journal-board";

    var saveButton = document.createElement("button");
    saveButton.id = "save-button";
    saveButton.textContent = "Save";
    saveButton.className = "style-4";
    saveButton.onclick = function () {
      writeJournal(document.getElementById("journal-title").value, document.getElementById("journal-board").value).then(() => {
        fetchJournals(storedPassword);
      })
    }

    document.getElementById("journal-card").className = "feedback-card";
    var form = document.getElementById("journal-form");
    form.innerHTML = "";
    form.appendChild(titleInput);
    form.appendChild(bodyInput);
    form.appendChild(saveButton);
  }

  function fetchJournals(password) {
    journalsExist().then((journalsBool) => {
      getJournals(password).then((results) => {
        if ((results === undefined || results === 0) && journalsBool) {
          return;
        } else if (results === 1 && journalsBool) {
          console.log("Decryption failed with given password");
          return;
        } else {
          //Manage password stuff
          storedPassword = password;
          document.getElementById("password").setCustomValidity('');
          hidePasswordModal();

          document.getElementById("journal-list").innerHTML = "";
          results.forEach(result => {
            //Initialize the list of journals into a left-column list.
            let listElement = document.createElement("li");
            let entry = document.createElement("button");
            entry.textContent = extensionTrimmer(result.filename);
            entry.id = result.filename;
            entry.className = "style-4";

            entry.onclick = function () {
              //Create the necessary elements.
              createElements();
              //Initialize the journal title & board values.
              let journalTitle = document.getElementById("journal-title");
              let journalBoard = document.getElementById("journal-board");
              journalTitle.value = extensionTrimmer(result.filename);
              journalBoard.value = result.contents;
            }
            listElement.appendChild(entry);
            document.getElementById("journal-list").appendChild(listElement);
          })
        }
      })
    })
  }

  function loadNewButton() {
    let newForm = document.getElementById("new-form");
    let button = document.createElement("button");
    button.textContent = "New 📘";
    button.id = "new-button";
    button.className = "style-4";
    button.onclick = function () {
      createElements();
    }
    newForm.innerHTML = "";
    newForm.appendChild(button);
  }

  function preventValidPasswordAttribute() {
    var passwordInput = document.getElementById("password");
    passwordInput.onkeydown = function (e) {
      passwordInput.setCustomValidity('Invalid');
    }
  }

  function watchPasswordSubmission() {
    var submitPasswordButton = document.getElementById("login");
    var submitPasswordInput = document.getElementById("password");

    submitPasswordButton.onclick = function () {
      fetchJournals(document.getElementById("password").value);
    }

    submitPasswordInput.onkeyup = function (event) {
      if (event.key.trim() === "Enter") {
        submitPasswordButton.click();
      }
    }
  }

  function showPasswordModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("is-open");
  }

  function hidePasswordModal() {
    const modal = document.querySelector(".modal");
    modal.classList.remove("is-open");
  }

  function initialize() {
    preventValidPasswordAttribute();
    watchPasswordSubmission();
    loadNewButton();

    journalsExist().then(result => {
      if (result) {
        document.getElementById("password").placeholder = "Enter your password."
      } else {
        document.getElementById("password").placeholder = "Enter a new PERMANENT password."
      }
    })
  }

  initialize();
})
