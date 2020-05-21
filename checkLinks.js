const inventory = require("./src/public/data/ParcelInventory.json");
const axios = require("axios").default;

// links to FIPS lookup
const links = {};

inventory.forEach((record) => {
  if (!links[record.LandingPageLink]) {
    links[record.LandingPageLink] = [];
  } else {
    links[record.LandingPageLink].push(record.FIPS);
  }
});

const pr = Object.keys(links)
  .filter((link) => new URL(link).protocol !== "ftp:")
  .map((link) => {
    return axios
      .head(link)
      .then((res) => {
        if (res.status !== 200) {
          console.log(res.message);
          const err = new Error();
          err.name = `ERR ${res.status}`;
          err.message = `Request rejected with status ${res.status}. ${res.message}`;
          throw err;
        }
      })
      .catch((err) => {
        console.error("Failed: ", err.name, err.message, "---", link);
      });
  });

Promise.all(pr)
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    console.log(err);
  });
