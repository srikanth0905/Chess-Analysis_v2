const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));

// OR if your pieces are inside a "piece" folder in public
app.use('/piece', express.static('public/piece'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
    // res.sendFile(path.join(__dirname, "../public", "index_test.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
