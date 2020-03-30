import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';

const Pg1 = () => {
    const handleClick = useCallback(() => {
        alert("Hello world")
    }, []);

	return (
		<p>
			Hello World, <button onClick={handleClick}>click !</button>
		</p>
	);
}

const render = (node) => ReactDOM.render(<Pg1 />, node);

export { render };

export default render;
