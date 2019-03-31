import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  Card,
  Spinner,
  Alert,
  InputGroup,
  Form,
  Button,
  Container,
  Row,
  Col,
  Jumbotron
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
    const parsedSearch = queryString.parse(location.search);

    if (parsedSearch.query === undefined) {
      parsedSearch.query = '';
    }
    return parsedSearch;
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

    this.setState({ books: [] });

    // If there is a string query then add into object
    if (queries.query) {
      queryObj.filters = [{ type: 'all', values: [queries.query] }];
    }

    const data = JSON.stringify(queryObj);

    // Request the book data from the api
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
      <Card className="h-100 mb4 shadow-sm">
        <Card.Header>{book.book_title}</Card.Header>
        <Card.Body>
          <Card.Subtitle className="mb-2 text-muted">
            {book.book_author}
          </Card.Subtitle>
          <Card.Text>
            {`Year: ${book.book_publication_year}`} <br />
            {`Country: ${book.book_publication_country}`} <br />
            {`City: ${book.book_publication_city}`} <br />
            {`Pages: ${book.book_pages}`} <br />
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  renderCardGrid(books) {
    const rows = [];
    for (let i = 0; i < books.length / 2; i++) {
      rows.push(
        <Row className="booksRow" key={i}>
          <Col xs={12} sm={6}>
            {this.renderCard(books[i * 2])}
          </Col>
          <Col xs={12} sm={6}>
            {books[i * 2 + 1] && this.renderCard(books[i * 2 + 1])}
          </Col>
        </Row>
      );
    }
    return rows;
  }

  handlePageChange(pageNumber = 1, queryOverride = null) {
    const { history } = this.props;
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

    const bookListItems = books.length ? this.renderCardGrid(books) : [];

    return (
      <div className="Books">
        <Jumbotron className="text-center">
          <h1>Books</h1>
          <p>
            Seach the full collection of books available. Alternatively enter a
            search string to filter the results.
          </p>
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
        </Jumbotron>
        <div className="d-flex justify-content-center">
          <Pagination
            size="lg"
            itemClass="page-item"
            linkClass="page-link"
            activePage={Number(page)}
            activeLinkClass="active"
            itemsCountPerPage={20}
            totalItemsCount={count}
            pageRangeDisplayed={5}
            onChange={pageNum => this.handlePageChange(pageNum)}
          />
        </div>

        {!books.length && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}
        <Container>{bookListItems}</Container>
      </div>
    );
  }
}

export default Books;
