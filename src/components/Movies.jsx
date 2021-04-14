import React, { Component } from 'react';
import { getMovies } from '../services/fakeMovieService';
import ListGroup from './common/ListGroup';
import Pagination from './common/Pagination';
import { paginate } from '../utils/paginate';
import { getGenres } from '../services/fakeGenreService';
import MoviesTable from './MoviesTable';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import SearchBox from './common/SearchBox';

class Movies extends Component {
  state = { 
    movies: [],
    genres: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: '',
    selectedGenre: null,
    sortColumn: { path: 'title', order: 'asc' }
   }

  componentDidMount() {
    const genres = [{ _id: '', name: 'All Genres'}, ...getGenres()]

    this.setState({ movies: getMovies(), genres })
  }

  handleDelete = (movie) => {
    const movies = this.state.movies.filter(m => m._id !== movie._id);
    this.setState({ movies })
   }

  handleLike = (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    movies[index].liked = !movies[index].liked;
    this.setState({ movies });
  }

  handlePageChange = page => {
   this.setState({ currentPage: page });
  }

  handleGenreSelect = genre => {
    this.setState({ selectedGenre: genre, searchQuery: '', currentPage: 1})
  }

  handleSearch = query => {
    this.setState({ searchQuery: query, selectedGenre: null, currentPage: 1 });
  }

  handleSort = sortColumn => {
    this.setState({ sortColumn })
  }

  getPageData = () => {
    const { 
      pageSize, 
      currentPage, 
      sortColumn, 
      selectedGenre,
      searchQuery, 
      movies: allMovies 
    } = this.state;

    let filtered = allMovies;
    if (searchQuery)
      filtered = allMovies.filter(movie => {
        return movie.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      });
    else if (selectedGenre && selectedGenre._id)
      filtered = allMovies.filter(movie => movie.genre._id === selectedGenre._id);

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order])

    const movies = paginate(sorted, currentPage, pageSize);

    return {totalCount: filtered.length, data: movies}
  }

  render() { 
    const { length: count } = this.state.movies;
    const { 
      pageSize, 
      currentPage, 
      sortColumn, 
    } = this.state;

    if (count === 0) return <p>There are no movies in the database.</p>;

    const {totalCount, data: movies} = this.getPageData();


    return ( 
      <div className="row">
        <div className="col-3">
          <ListGroup 
            items={this.state.genres} 
            selectedItem={this.state.selectedGenre}
            onItemSelect={this.handleGenreSelect}
          />
        </div>
        <div className="col">
          <Link 
            to='/movies/new'
            className='btn btn-primary'
            style={{ marginBottom: 20 }}
          >
            New Movie
          </Link>
          <p>Showing { totalCount } movies in the database.</p>
          <SearchBox value={ this.state.searchQuery } onChange={ this.handleSearch } />
          <MoviesTable 
            movies={movies} 
            onLike={this.handleLike} 
            onDelete={this.handleDelete} 
            onSort={this.handleSort}
            sortColumn={sortColumn}
          />
          <Pagination 
            itemsCount={totalCount} 
            pageSize={pageSize} 
            onPageChange={this.handlePageChange} 
            currentPage={currentPage}
          />
        </div>
      </div>
     );
  }
}
 
export default Movies;