const db = require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/src/config/db');

db.query("SHOW TABLES", (err, results) => {
    if (err) {
        console.error("Error showing tables:", err);
    } else {
        console.log("Tables in database:", results);
    }
    db.end();
});
