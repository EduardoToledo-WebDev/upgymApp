const express = require('express');
const app = express();
const port = 3000;
const routes = require('./api/endPoint');
const cors = require('cors');


app.use(cors({
    // 'origin: true' hace que el backend responda dinámicamente permitiendo 
    // el origen exacto que hace la petición (ideal para Capacitor y desarrollo)
    origin: "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', routes);

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});