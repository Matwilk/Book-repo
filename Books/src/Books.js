import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { ListGroup, ListGroupItem, Card, Spinner } from 'react-bootstrap';
import { Button } from 'react-bootstrap/Button';
import Pagination from 'react-js-pagination';

import './Books.scss';

const url = 'http://nyx.vima.ekt.gr:3000/api/books';

class Books extends Component {
  constructor(props: Object) {
    super(props);
    this.state = { books: {}, count: 0, error: '' };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  getCurrentPage() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    return query.page ? query.page : 1;
  }

  componentDidMount() {
    this.fetchPage(this.getCurrentPage());
  }

  componentDidUpdate(prevProps) {
    window.scrollTo(0, 0);

    if (prevProps.location.search !== this.props.location.search) {
      this.setState();
      this.fetchPage(this.getCurrentPage());
    }
  }

  fetchPage(page) {
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
      .then(results =>
        this.setState({
          books: Object.assign({}, this.state.books, {
            [page]: results.books
          }),
          count: results.count
        })
      )
      .catch(error => this.setState({ error }));
  }

  renderCard(book) {
    return (
      <Card>
        <Card.Header>{book.book_title}</Card.Header>
        <ListGroup variant="flush">
          <ListGroupItem>{`Author: ${book.book_author}`}</ListGroupItem>
          <ListGroupItem>{`Year: ${book.book_publication_year}`}</ListGroupItem>
          <ListGroupItem>{`Country: ${
            book.book_publication_country
          }`}</ListGroupItem>
          <ListGroupItem>{`City: ${book.book_publication_city}`}</ListGroupItem>
          <ListGroupItem>{`Pages: ${book.book_pages}`}</ListGroupItem>
        </ListGroup>
      </Card>
    );
  }

  handlePageChange(pageNumber) {
    const { history } = this.props;

    history.push({
      pathname: '/',
      search: `?page=${pageNumber}`
    });
  }

  render() {
    const { books, count } = this.state;
    const page = this.getCurrentPage();

    if (!(page in books)) {
      return <Spinner animation="border" />;
    }

    const bookListItems = books[page].map(book => (
      <ListGroupItem key={book.id}>{this.renderCard(book)}</ListGroupItem>
    ));

    return (
      <div className="Books">
        <h1>Books</h1>
        <ListGroup>{bookListItems}</ListGroup>
        <Pagination
          itemClass="page-item"
          linkClass="page-link"
          activePage={page}
          itemsCountPerPage={20}
          totalItemsCount={count}
          pageRangeDisplayed={5}
          onChange={pageNum => this.handlePageChange(pageNum)}
        />
      </div>
    );
  }
}

export default Books;
