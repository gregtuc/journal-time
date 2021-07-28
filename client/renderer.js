
window.addEventListener('load', () => {
    //Overriding the 'valid' attribute of the password input field.
    function preventValidByDefault() {
        var passwordInput = document.getElementById("password");
        passwordInput.onkeydown = function () {
            passwordInput.setCustomValidity('Invalid');
        }
    }

    //Hide the password modal.
    function hidePasswordModal() {
        const modal = document.querySelector(".modal");
        modal.classList.remove("is-open");
    }

    //Handling password submission.
    function handlePasswordInput() {
        var submitPasswordButton = document.getElementById("login");
        var submitPasswordInput = document.getElementById("password");

        submitPasswordButton.onclick = function () {
            window.api.send("toSavePassword", { data: String(document.getElementById("password").value).trim() });
            fetchJournals();
        }

        submitPasswordInput.onkeyup = function (event) {
            if (event.key.trim() === "Enter") {
                submitPasswordButton.click();
            }
        }
    }

    //Handle clicks of the new button.
    function newButtonHandler() {
        var button = document.getElementById("new-button");
        button.onclick = function () {
            generateJournalForm("", "", "");
        }
    }

    //Customize user password placeholder based on whether they have used the application before or not.
    function passwordPlaceholderHandler() {
        window.api.send("toGetJournalsExist");
        window.api.receive("fromJournalsExist", (data) => {
            if (data) {
                document.getElementById("password").placeholder = "Enter your password."
            } else {
                document.getElementById("password").placeholder = "Enter a new PERMANENT password."
            }
        });
    }

    //Method to delete everything if a user forgot their password.
    function forgotPasswordHandler() {
        document.getElementById("forgot-password-button").onclick = function () {
            window.api.send("toDeleteAllJournals", {});
            passwordPlaceholderHandler();
        }
    }

    //Fetch journals and inject their contents into the menu bar. Attach event handlers to click events on the menu items.
    function fetchJournals() {
        window.api.send("toGetAllJournals", {});
        window.api.receive("fromGetAllJournals", (journals) => {
            if (journals !== false) {
                document.getElementById("password").setCustomValidity('');
                hidePasswordModal();
                var journalMenuList = document.getElementById("journal-menu-list");
                journalMenuList.innerHTML = "";

                for (var i = 0; i < journals.length; i++) {
                    fetchJournalLogic(journals[i].uuid, journals[i].title, journals[i].body, journalMenuList)
                }
            }
        });
    }

    function fetchJournalLogic(uuid, title, body, journalMenuList) {
        let listElement = document.createElement("li");
        let journalButton = document.createElement("button");
        journalButton.id = uuid;
        journalButton.className = "primary-button";
        journalButton.textContent = title;

        journalButton.onclick = function () {
            generateJournalForm(uuid, title, body);
        }
        listElement.appendChild(journalButton);
        journalMenuList.appendChild(listElement);
    }

    //Generate the Journal Form in the center of the page with the values passed as parameters.
    function generateJournalForm(uuid, title, body) {
        var titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.placeholder = "Journal Title";
        titleInput.id = "journal-title";
        titleInput.value = title;

        var bodyInput = document.createElement("textarea");
        bodyInput.placeholder = "Your Journal";
        bodyInput.id = "journal-board";
        bodyInput.value = body;

        var saveButton = document.createElement("button");
        saveButton.id = "save-button";
        saveButton.textContent = "Save";
        saveButton.className = "primary-button";
        saveButton.onclick = function () {
            if (uuid !== "") {
                window.api.send("toSaveExistingJournal", { data: { uuid: uuid, title: document.getElementById("journal-title").value, body: document.getElementById("journal-board").value } });
            } else {
                window.api.send("toSaveNewJournal", { data: { title: document.getElementById("journal-title").value, body: document.getElementById("journal-board").value } });
            }
            fetchJournals();
        }

        var form = document.getElementById("journal-form");
        form.innerHTML = "";
        form.appendChild(titleInput);
        form.appendChild(bodyInput);
        form.appendChild(saveButton);
    }

    preventValidByDefault();
    passwordPlaceholderHandler()
    handlePasswordInput();
    forgotPasswordHandler()
    newButtonHandler();
})
