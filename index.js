function createTableColumnInto(rowElement, value) {
    let tableBody = document.getElementById("usersTableBody")
    let col = document.createElement("td")
    col.classList.add("table-element")
    col.innerText = value

    rowElement.appendChild(col)
}

function createTableRowFromUser(user) {
    let tableBody = document.getElementById("usersTableBody")
    let row = document.createElement("tr")
    createTableColumnInto(row, user.username)
    createTableColumnInto(row, user.firstname)
    createTableColumnInto(row, user.surname)

    tableBody.appendChild(row)

}

function fetchFakeUsers() {
    return new Promise((resolve, reject) =>
        fetch('https://jsonplaceholder.typicode.com/users')
            .then((response) => response.json())
            .then((json) => {
                let results = []

                for (const index in json) {
                    const user = json[index]
                    const nameExpr = user.name.match(/\w+ ?[IVXLCDM]*$/)
                    const surname = nameExpr[0].trim()
                    const firstname = nameExpr.input.slice(0, nameExpr.index).trim()

                    results.push({
                        username: user.username,
                        firstname:  firstname,
                        surname:  surname
                    })
                }
                resolve(results)
            })
            .catch((err) => reject(err))
    )
}

function loadUsers(users) {
    for (const index in users) {
        createTableRowFromUser(users[index])
    }
}

function searchUsers() {

}

fetchFakeUsers().then((users) => loadUsers(users))
