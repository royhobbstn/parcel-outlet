import React, { useState, useEffect } from "react";
import AppBar from "./components/AppBar.js";
import { Tree } from "./components/Tree.js";
import { LinkList } from "./components/LinkList.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CoverageMap } from "./components/CoverageMap";

function App() {
  const [hasError, setErrors] = useState(false);
  const [inventory, setInventory] = useState([]);

  async function fetchData() {
    const res = await fetch("/data/database_data.json");
    res
      .json()
      .then((res) => {
        setInventory(res);
      })
      .catch((err) => setErrors(err));
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <AppBar />
      <Switch>
        <Route path="/coverage-map">
          <CoverageMap inventory={inventory} />
        </Route>

        <Route exact path="/">
          <LinkList />
          <Tree inventory={crunchInventory(inventory)} />
          {hasError ? (
            <p
              style={{
                margin: "auto",
                width: "300px",
                color: "red",
                marginTop: "30px",
              }}
            >
              There was an error loading data.
            </p>
          ) : null}
        </Route>
      </Switch>
    </Router>
  );
}

function crunchInventory(inventory) {
  if (!inventory) {
    return {};
  }

  const state = {};

  Object.keys(inventory).forEach((key) => {
    // todo borough, municipality, etc
    // if(d.GeoType !== 'County') {
    //   return;
    // }

    const stfips = key.slice(0, 2);
    if (!state[stfips]) {
      state[stfips] = {};
    }

    const cntyplcfips = key.slice(2);
    if (!state[stfips][cntyplcfips]) {
      state[stfips][cntyplcfips] = inventory[key];
    }

  });

  return state;
}

export default App;
