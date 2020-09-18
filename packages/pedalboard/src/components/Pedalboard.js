import React from 'react';

import css from './Pedalboard.scss';

const PedalboardHeader = () => (
	<header className={css.PedalboardHeader}>
		<h1>@wam/Pedalboard</h1>
	</header>
);

const PedalboardBoard = () => (
	<main className={css.PedalboardBoard}>
		board
	</main>
);

const PedalboardSelector = () => (
	<aside className={css.PedalboardSelector}>
		selector
	</aside>
);

const Pedalboard = () => {
	return (
		<section className={css.Pedalboard}>
			<PedalboardHeader />
			<div className={css.Pedalboard_content}>
				<PedalboardBoard />
				<PedalboardSelector />
			</div>
		</section>
	);
};

export default Pedalboard;
