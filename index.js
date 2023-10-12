const STORAGE_ENTRY = "users"
const PLACEHOLDER_TYPICODE_JSON_URL = "https://jsonplaceholder.typicode.com/users"

let knownUsers = []
let searching = false

function createTableColumnInto(rowElement, value) {
    const tableBody = document.getElementById("usersTableBody")
    const col = document.createElement("td")
    col.classList.add("table-element")
    col.innerText = value

    rowElement.appendChild(col)

    return col
}

function createTableRowFromUser(user) {
    const tableBody = document.getElementById("usersTableBody")
    const row = document.createElement("tr")
    createTableColumnInto(row, user.username)
    createTableColumnInto(row, user.firstname)
    createTableColumnInto(row, user.surname)

    const modifyColumnContainer = createTableColumnInto(row, "")
    const deleteButton = document.createElement("button")
    deleteButton.innerText = "Kustuta"
    deleteButton.type = "button"
    deleteButton.title = "Eemalda kasutaja nimekirjast"
    deleteButton.onclick = function() {
        deleteUser(user)
        refreshEntries()
    }
    modifyColumnContainer.appendChild(deleteButton)



    tableBody.appendChild(row)

    return row
}

function fetchFakeUsers() {
    return new Promise((resolve, reject) =>
        fetch(PLACEHOLDER_TYPICODE_JSON_URL)
            .then((response) => response.json())
            .then((json) => {
                let results = []

                // the JSON does not quite match what we'll be saving
                // so, let's transform it a bit
                for (const index in json) {
                    const user = json[index]
                    // surnames can have roman numerals, and we're only given the full name
                    const nameExpr = user.name.match(/\w+ ?[IVXLCDM]*$/)
                    const surname = nameExpr[0].trim()
                    const firstname = nameExpr.input.slice(0, nameExpr.index).trim()

                    results.push({
                        username: user.username,
                        firstname: firstname,
                        surname: surname
                    })
                }
                resolve(results)
            })
            .catch((err) => reject(err))
    )
}

function createEntries(users) {
    const tableBody = document.getElementById("usersTableBody")
    tableBody.replaceChildren()

    for (const index in users)
        createTableRowFromUser(users[index])

}

function refreshEntries() {
    if (searching)
        searchUsersAction()
    else
        createEntries(knownUsers)
}


function searchUsersAction() {
    const expectedUsername = document.getElementById("usernameSearch").value.toLowerCase()
    const expectedFirstName = document.getElementById("firstnameSearch").value.toLowerCase()
    const expectedSurname = document.getElementById("surnameSearch").value.toLowerCase()
    const noResultText = document.getElementById("noResultText")
    const resultCountText = document.getElementById("resultCountText")
    const resultCount = document.getElementById("resultCount")
    const usersTable = document.getElementById("usersTable")

    let results = []
    searching = false

    for (const user of knownUsers) {
        let matches = true
        if (expectedUsername && expectedUsername.trim() !== "")
            if (!user.username.toLowerCase().includes(expectedUsername))
                matches = false
        if (expectedFirstName && expectedFirstName.trim() !== "")
            if (!user.firstname.toLowerCase().includes(expectedFirstName))
                matches = false
        if (expectedSurname && expectedSurname.trim() !== "")
            if (!user.surname.toLowerCase().includes(expectedSurname))
                matches = false
        if (matches) {
            results.push(user)
            searching = true
        }
    }

    resultCount.innerText = results.length

    usersTable.hidden = (results.length == 0)
    resultCountText.hidden = (results.length == 0)
    noResultText.hidden = (results.length > 0)

    createEntries(results)
}

function saveUsers(users) {
    window.localStorage.setItem(STORAGE_ENTRY, JSON.stringify(users))
}

function addUser(username, firstname, surname) {
    let isUnique = true

    for (const knownUser of knownUsers)
        if (username == knownUser.username)
            isUnique = false

    if (isUnique) {
        knownUsers.push({username: username, firstname: firstname, surname: surname})
        saveUsers(knownUsers)
        refreshEntries()
    }

    return isUnique
}

function deleteUser(user) {
    const index = knownUsers.indexOf(user)
    knownUsers.splice(index, 1)
    saveUsers(knownUsers)
}

function importUsers(users) {
    // could be done better if usernames must be unique with just a map, but i'm in this far now...
    for (const user of users) {
        let isUnique = true

        for (const knownUser of knownUsers)
            if (user.username == knownUser.username)
                isUnique = false

        if (isUnique)
            knownUsers.push(user)
    }
}

function importPlaceholderUsers() {
    fetchFakeUsers()
        .then((users) => {
            importUsers(users)
            saveUsers(users)
            refreshEntries()
        })
        .catch((err) => {
            console.error(err)
            document.getElementById("errorMessage").innerText =
                "Töötlemisel tekkis viga, vajuta SHIFT+CTRL+J, et näha rohkem"
        })
}

function openNewUserForm() {
    const formContainer = document.getElementById("addNewUserFormContainer")
    formContainer.hidden = !formContainer.hidden

}

function addNewUserAction() {
    const addUserErrorMessage = document.getElementById("addUserErrorMessage")
    const usernameField = document.getElementById("addUsername")
    const firstnameField = document.getElementById("addFirstname")
    const surnameField = document.getElementById("addSurname")
    const username = usernameField.value
    const firstname = firstnameField.value
    const surname = surnameField.value

    let valid = true
    let reason = ""
    if (!username || username.trim() === "") {
        valid = false;
        reason = "Kasutajanimi"
    } else if (!firstname || firstname.trim() === "") {
        valid = false;
        reason = "Eesnimi"
    } else if (!surname || surname.trim() === "") {
        valid = false;
        reason = "Perenimi"
    }

    if (!valid) {
        addUserErrorMessage.innerText = `${reason} ei kõlba`
        return
    }

    addUserErrorMessage.innerText = ""
    if (!addUser(username, firstname, surname)) {
        addUserErrorMessage.innerText = "Kasutajanimi on juba olemas"
        return
    }

    document.getElementById("addNewUserFormContainer").hidden = true
}


document.addEventListener("DOMContentLoaded", (event) => {

    if (!window.localStorage.getItem(STORAGE_ENTRY))
        importPlaceholderUsers()
    else {
        knownUsers = JSON.parse(window.localStorage.getItem(STORAGE_ENTRY))
        refreshEntries()
    }

    document.getElementById("reimportUsers").onclick = importPlaceholderUsers
    document.getElementById("addNewUser").onclick = openNewUserForm
})
