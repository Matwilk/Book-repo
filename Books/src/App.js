import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Books from './Books';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Books</h1>
        <Router>
          <div>
            <Route exact path="/" component={Books} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
