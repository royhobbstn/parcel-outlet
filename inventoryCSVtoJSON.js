const fs = require("fs");
const Papa = require("papaparse");

const file = fs.readFileSync("./input/ParcelInventory.csv", {
  encoding: "utf8",
});

const json = Papa.parse(file, { skipEmptyLines: true, header: true });

fs.writeFileSync(
  "./src/public/data/ParcelInventory.json",
  JSON.stringify(json.data)
);
