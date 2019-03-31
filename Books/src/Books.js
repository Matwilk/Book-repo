import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  ListGroup,
  ListGroupItem,
  Card,
  Spinner,
  Alert,
  InputGroup,
  Form,
  Button
} from 'react-bootstrap';
import Pagination from 'react-js-pagination';

import './Books.scss';

const url = 'http://nyx.vima.ekt.gr:3000/api/books';

class Books extends Component {
  constructor(props: Object) {
    super(props);
    this.state = {
      books: {},
      count: 0,
      error: '',
      query: this.getCurrentPageQueries().query
    };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  getCurrentPageQueries() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    return query;
  }

  componentDidMount() {
    this.fetchPage();
  }

  componentDidUpdate(prevProps) {
    window.scrollTo(0, 0);

    if (prevProps.location.search !== this.props.location.search) {
      this.fetchPage();
    }
  }

  fetchPage() {
    const queries = this.getCurrentPageQueries();

    const queryObj = { page: queries.page };
    if (queries.query) {
      queryObj.filters = [{ type: 'all', values: [queries.query] }];
    }

    const data = JSON.stringify(queryObj);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then(results => {
        this.setState({
          books: results.books,
          count: results.count
        });
      })
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

  handlePageChange(pageNumber = 1, queryOverride = null) {
    const { history } = this.props;
    this.setState({ books: [] });
    history.push({
      pathname: '/',
      search: `?page=${pageNumber}&query=${
        queryOverride !== null
          ? queryOverride
          : this.getCurrentPageQueries().query
      }`
    });
  }

  handleInputChange(event) {
    this.setState({ query: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.handlePageChange(1, this.state.query);
  }

  render() {
    const { books, count, error, query } = this.state;
    const page = this.getCurrentPageQueries().page;

    if (error) {
      return (
        <Alert key={'err'} variant={'primary'}>
          Failed to fetch - check your connection
        </Alert>
      );
    }

    const bookListItems = books.length
      ? books.map(book => (
          <ListGroupItem key={book.id}>{this.renderCard(book)}</ListGroupItem>
        ))
      : [];

    return (
      <div className="Books">
        <Form onSubmit={e => this.handleSubmit(e)}>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Enter your search string"
              value={query}
              aria-label="Search"
              aria-describedby="basic-addon1"
              onChange={e => this.handleInputChange(e)}
            />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </InputGroup>
        </Form>
        {!books.length && <Spinner animation="border" />}

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
