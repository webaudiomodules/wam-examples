import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const Pg1 = ({ name }) => {
	const handleClick = useCallback(() => {
		alert(`Hello ${name} from Pg1`);
	}, [name]);

	return (
		<p>
			Pg1: <button type="button" onClick={handleClick}>click !</button>
		</p>
	);
};

Pg1.propTypes = {
	name: PropTypes.string.isRequired,
};

const render = (node) => {
	console.info(`[Pg1] React version: ${ReactDOM.version}`);
	ReactDOM.render(<Pg1 />, node);
};

export {
	Pg1,
	render,
};
