const fs = require("fs");
const shapefile = require("shapefile");

const gdbDirAll = fs.readdirSync("./inspectGDB");
const shpDirAll = fs.readdirSync("./inspectSHP");

const filterGitignore = (d) => d !== ".gitignore";

const gdbDir = gdbDirAll.filter(filterGitignore);
const shpDir = shpDirAll.filter(filterGitignore);

const statCounter = new StatContext();

console.log({ gdbDir });
console.log({ shpDir });

if (gdbDir.length > 1 && shpDir.length > 1) {
  console.error(
    "Both GDB and SHP folders have files.  Only one entry can be processed at a time.  Please remove files from one of the folders."
  );
  process.exit();
}

if (gdbDir.length === 0 && shpDir.length === 0) {
  console.error("No files found.  Exiting");
  process.exit();
}

if (shpDir.length) {
  processShp(shpDir);
} else {
  processGdb(gdbDir);
}

function processShp(files) {
  const filename_root = files[0].split(".").slice(0, -1).join();
  console.log(`processing shapefile: ${filename_root}.shp`);

  let writeStream = fs.createWriteStream(
    `./tempGeoJSON/${filename_root}.ndgeojson`
  );

  shapefile
    .open(`./inspectSHP/${filename_root}.shp`)
    .then((source) =>
      source.read().then(function log(result) {
        if (result.done) {
          writeStream.end();
          return;
        }
        statCounter.countStats(result.value);
        writeStream.write(JSON.stringify(result.value) + "\n", "utf8");
        return source.read().then(log);
      })
    )
    .catch((error) => console.error(error.stack));

  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on("finish", () => {
    fs.writeFileSync(
      `./tempGeoJSON/${filename_root}.json`,
      JSON.stringify(statCounter.export()),
      "utf8"
    );
    console.log(
      `wrote all ${statCounter.rowCount} rows to file: ./tempGeoJSON/${filename_root}.ndgeojson`
    );
  });
}

function processGdb(files) {
  console.log("processing geodatabase");
}

function StatContext() {
  this.rowCount = 0;
  this.fields = null;

  this.export = () => {
    return {
      rowCount: this.rowCount,
      fields: this.fields,
    };
  };

  this.countStats = (row) => {
    this.rowCount++;

    // add fields names one time
    if (!this.fields) {
      this.fields = {};
      // iterate through columns in each row, add as field name to summary object
      Object.keys(row.properties).forEach((f) => {
        this.fields[f] = {
          types: [],
          uniques: {},
          mean: 0,
          max: 0,
          min: 0,
          numCount: 0,
          strCount: 0,
        };
      });
    }

    Object.keys(row.properties).forEach((f) => {
      const value = row.properties[f];
      const type = typeof value;
      const types = this.fields[f].types;

      if (type === "string" || type === "number") {
        if (!types.includes(type)) {
          this.fields[f].types.push(type);
        }
      }

      if (type === "string") {
        this.fields[f].strCount++;

        const uniques = Object.keys(this.fields[f].uniques);

        // caps uniques to 1000.  Prevents things like ObjectIDs being catalogued extensively.
        if (uniques.length < 1000) {
          if (!uniques.includes(value)) {
            this.fields[f].uniques[value] = 1;
          } else {
            this.fields[f].uniques[value]++;
          }
        }
      } else if (type === "number") {
        this.fields[f].numCount++;

        if (value > this.fields[f].max) {
          this.fields[f].max = value;
        }
        if (value < this.fields[f].min) {
          this.fields[f].min = value;
        }

        // might cause overflow here
        this.fields[f].mean =
          (this.fields[f].mean * (this.fields[f].numCount - 1) + value) /
          this.fields[f].numCount;
      } else {
        // probably null.  skipping;
      }
    });
  };
}
