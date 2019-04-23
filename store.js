module.exports = {
    createUser ({ username, password }) {
        console.log(`Add User ${username} with password ${password}`)
        return Promise.resolve()
    }
}