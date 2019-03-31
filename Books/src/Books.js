import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import './Books.scss';

const url = 'http://nyx.vima.ekt.gr:3000/api/books';

class Books extends Component {
  constructor(props: Object) {
    super(props);
    this.state = { results: { books: [] }, error: '' };
  }

  static propTypes = {
    location: PropTypes.object
  };

  componentDidMount() {
    const query = queryString.parse(this.props.location.search);
    const page = query.page ? query.page : 1;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: queryString.stringify({ page })
    })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then(results => this.setState({ results }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { results } = this.state;
    const { location } = this.props;

    const bookListItems = results.books.map((book, index) => (
      <li key={index}>{book.book_title}</li>
    ));

    return (
      <div className="Books">
        <h1>Books</h1>
        <ul>{bookListItems}</ul>
      </div>
    );
  }
}

export default Books;
