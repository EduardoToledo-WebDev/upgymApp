import './Home.css'

function Home() {
    const handleLogout = () => {
        fetch("http://192.168.182.149:3000/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    // Redirigir al login
                    window.location.href = "/";
                }
            })
            .catch(error => {
                console.error(error);
            });
    }
    return (
        <div>
            <h1>Home</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export { Home };

