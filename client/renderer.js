
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
        const passwordModal = document.querySelector(".modal-password");
        passwordModal.classList.remove("is-open");
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
            generateJournalForm("", "", "", "", "", "");
        }
    }

    //Customize user password placeholder based on whether they have used the application before or not.
    function passwordPlaceholderHandler() {
        window.api.send("toGetJournalsExist", { data: "" });
        window.api.receive("fromGetJournalsExist", (data) => {
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
            window.api.send("toDeleteAllJournals", { data: "" });
            passwordPlaceholderHandler();
        }
    }

    //Fetch journals and inject their contents into the menu bar. Attach event handlers to click events on the menu items.
    function fetchJournals() {
        window.api.send("toGetAllJournals", { data: "" });
        window.api.receive("fromGetAllJournals", (journals) => {
            if (journals !== false) {
                document.getElementById("password").setCustomValidity('');
                hidePasswordModal();
                var journalMenuList = document.getElementById("journal-menu-list");
                journalMenuList.innerHTML = "";

                for (var i = 0; i < journals.length; i++) {
                    fetchJournalLogic(journals[i].uuid, journals[i].title, journals[i].body, journals[i].sentiment, journals[i].datetime.date, journals[i].datetime.time, journalMenuList)
                }
            }
        });
    }

    function fetchJournalLogic(uuid, title, body, sentiment, date, time, journalMenuList) {
        let listElement = document.createElement("li");
        let journalButton = document.createElement("button");
        journalButton.id = uuid;
        journalButton.className = "primary-button";
        journalButton.textContent = title;

        journalButton.onclick = function () {
            generateJournalForm(uuid, title, body, sentiment, date, time);
        }
        listElement.appendChild(journalButton);
        journalMenuList.appendChild(listElement);
    }

    //Generate the Journal Form in the center of the page with the values passed as parameters.
    function generateJournalForm(uuid, title, body, sentiment, date, time) {

        var titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.placeholder = "Journal Title";
        titleInput.id = "journal-title";
        titleInput.value = title;

        var bodyInput = document.createElement("textarea");
        bodyInput.placeholder = "Your Journal";
        bodyInput.id = "journal-board";
        bodyInput.value = body;

        var dateInput = document.createElement("input");
        dateInput.type = "text";
        dateInput.id = "journal-date";
        dateInput.style.width = "50%";
        dateInput.style.height = "7%";
        dateInput.value = "Last change made on: " + date + " " + time;
        dateInput.disabled = true;

        var sentimentInput = document.createElement("input");
        sentimentInput.type = "text";
        sentimentInput.id = "journal-sentiment";
        sentimentInput.style.width = "50%";
        sentimentInput.style.height = "7%";
        sentimentInput.value = "Sentiment: " + sentiment;
        sentimentInput.disabled = true;

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

        var saveButtonContainer = document.createElement("div");
        saveButtonContainer.className = "center-save-button";
        saveButtonContainer.append(saveButton);

        var form = document.getElementById("journal-form");
        form.innerHTML = "";
        form.appendChild(titleInput);
        form.appendChild(dateInput);
        form.appendChild(sentimentInput);
        form.appendChild(bodyInput);
        form.appendChild(saveButtonContainer);
    }

    //Method to handle the transitions between inputs in the authenticator
    function handleAuthenticator() {
        var body = document.getElementById("wrapper");
        if (body) {
            body.addEventListener("keyup", function (e) {
                var key = e.key;
                var t = document.getElementById(e.target.id);
                var sib = document.getElementById(t.nextElementSibling.id);
                if (e.target.id === "pin6") {
                    document.activeElement.blur();
                    return false;
                }
                if (String(key).toLowerCase().trim() != "tab" && (key < 0 || key > 57)) {
                    e.preventDefault();
                    return false;
                }
                if (String(key).toLowerCase().trim() === "tab") {
                    return true;
                }
                if (!sib) {
                    sib = body.getElementsByTagName('input')[0];
                }
                sib.focus();
            })
            body.addEventListener("keydown", function (e) {
                var key = e.key;
                if (String(key).toLowerCase().trim() === "tab" || (key >= 1 && key <= 9)) {
                    return true;
                }
                e.preventDefault();
                return false;
            })
            body.addEventListener("click", function (e) {
                var clickedElement = document.getElementById(e.target.id);
                if (clickedElement != null) {
                    clickedElement.focus();
                }
            })
        }
    }

    //Method to add the is-open class to the authenticator model
    function handleAuthenticatorModalOpen() {
        document.getElementById("pair-button").addEventListener("click", function () {
            const authenticatorModal = document.querySelector("#wrapper");
            authenticatorModal.classList.add("is-open");
        })
    }

    //Method to handle user input on whether they want to generate a code (alpha) or submit a code that they have on another device (beta)
    function handleAuthenticatorInputs() {
        document.getElementById("alpha-signal").addEventListener("click", function () {
            handleAlphaPairer();
        })
    }

    //Method to get a code for alpha connections
    function handleAlphaPairer() {
        window.api.send("toPairDevices", {
            data: {
                type: true
            }
        });
        window.api.receive("fromPairDevices", (data) => {
            if (data.code) {

                //Insert the code into the input elements
                for (var i = 0; i < 6; i++) {
                    switch (i) {
                        case 0:
                            var node = document.getElementById("pin1");
                            node.value = String(data.code).charAt(0);
                            node.disabled = true;
                            break;
                        case 1:
                            var node = document.getElementById("pin2");
                            node.value = String(data.code).charAt(1);
                            node.disabled = true;
                            break;
                        case 2:
                            var node = document.getElementById("pin3");
                            node.value = String(data.code).charAt(2);
                            node.disabled = true;
                            break;
                        case 3:
                            var node = document.getElementById("pin4");
                            node.value = String(data.code).charAt(3);
                            node.disabled = true;
                            break;
                        case 4:
                            var node = document.getElementById("pin5");
                            node.value = String(data.code).charAt(4);
                            node.disabled = true;
                            break;
                        case 5:
                            var node = document.getElementById("pin6");
                            node.value = String(data.code).charAt(5);
                            node.disabled = true;
                    }
                }

                //Modify the pairing button.
                var pairingButton = document.getElementById("authenticate-button")
                pairingButton.textContent = "Waiting for response...";
                pairingButton.disabled = true;

                //Modify the pairing info message.
                var pairingMessage = document.getElementById("authentication-message");
                pairingMessage.textContent = "Please enter this 6-digit verification code on your other device."
            }
        });
    }

    //Method to submit a code for beta connections
    function handleBetaPairer(code) {
        window.api.send("toPairDevices", {
            data: {
                type: false,
                code: code
            }
        });
    }

    handleAuthenticator();
    handleAuthenticatorModalOpen();
    handleAuthenticatorInputs();
    preventValidByDefault();
    passwordPlaceholderHandler()
    handlePasswordInput();
    forgotPasswordHandler()
    newButtonHandler();
    handleAuthenticator();
})
