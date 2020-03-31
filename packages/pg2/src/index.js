import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class Pg2 extends Component {
	// eslint-disable-next-line react/destructuring-assignment
	handleClick = () => alert(`Hello ${this.props.name} from Pg2`);

	render() {
		return (
			<p>
				Pg2: <button type="button" onClick={this.handleClick}>click !</button>
			</p>
		);
	}
}

Pg2.propTypes = {
	name: PropTypes.string.isRequired,
};

const render = (node) => {
	console.log(ReactDOM.version);
	ReactDOM.render(<Pg2 />, node);
};

export { render };

export default render;
