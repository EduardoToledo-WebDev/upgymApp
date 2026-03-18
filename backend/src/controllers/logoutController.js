const logout = (req, res) => {
    res.clearCookie('access_token');
    res.send('Logout exitoso');
}

module.exports = { logout };