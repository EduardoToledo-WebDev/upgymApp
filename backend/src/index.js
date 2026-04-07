const express = require('express');
const app = express();
const port = 3000;
const routes = require('./api/endPoint');
const cors = require('cors');
const path = require('path');

app.use('/gifs', express.static(path.join(__dirname, './public/gifs')));
app.use('/premios', express.static(path.join(__dirname, './public/premios')));
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', routes);

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});