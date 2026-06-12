<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const CAT_WIDTH = 64;
	const GROUND_OFFSET = 4;
	const WALK_SPEED = 0.045;
	const CHASE_SPEED = 0.12;
	const BALL_FRICTION = 0.985;
	const GRAVITY = 0.0009;

	type Ball = {
		id: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		color: string;
	};

	type Heart = { id: number; x: number; emoji: string };

	type CatState = 'idle' | 'walking' | 'chasing' | 'eating' | 'happy' | 'sleeping';

	let x = 120;
	let direction = 1;
	let state: CatState = 'idle';
	let stateTimer = 0;
	let targetX: number | null = null;
	let balls: Ball[] = [];
	let hearts: Heart[] = [];
	let food: { x: number } | null = null;
	let showMenu = false;
	let happiness = 50;
	let fullness = 50;
	let nextId = 1;
	let lastTime = 0;
	let rafId: number;
	let viewportWidth = 1024;

	const BALL_COLORS = ['#f87171', '#60a5fa', '#fbbf24', '#34d399', '#c084fc'];

	const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

	const setState = (next: CatState, duration = 0) => {
		state = next;
		stateTimer = duration;
	};

	const pickIdleBehavior = () => {
		if (fullness < 25) {
			setState('sleeping', 4000 + Math.random() * 3000);
		} else if (Math.random() < 0.5) {
			setState('walking', 2000 + Math.random() * 3000);
			direction = Math.random() < 0.5 ? -1 : 1;
		} else {
			setState('idle', 1500 + Math.random() * 2500);
		}
	};

	const tick = (time: number) => {
		const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
		lastTime = time;

		stateTimer -= dt;

		// Move balls with friction + bounce off walls
		balls = balls
			.map((b) => {
				b.vy += GRAVITY * dt;
				b.x += b.vx * dt;
				b.y = Math.max(0, b.y + b.vy * dt);
				if (b.y === 0 && b.vy > 0) {
					b.vy = -b.vy * 0.5;
					if (Math.abs(b.vy) < 0.02) b.vy = 0;
				}
				if (b.x < 10 || b.x > viewportWidth - 30) {
					b.vx = -b.vx;
					b.x = clamp(b.x, 10, viewportWidth - 30);
				}
				b.vx *= Math.pow(BALL_FRICTION, dt / 16);
				return b;
			})
			.filter((b) => Math.abs(b.vx) > 0.002 || b.y > 0 || Math.abs(b.vy) > 0.002 || true);

		// Decide target: food takes priority, then a moving ball
		if (food) {
			targetX = food.x;
			if (state !== 'eating') setState('chasing');
		} else {
			const movingBall = balls.find((b) => Math.abs(b.vx) > 0.01);
			if (movingBall && state !== 'eating' && state !== 'sleeping') {
				targetX = movingBall.x;
				setState('chasing');
			}
		}

		if (state === 'chasing' && targetX !== null) {
			const dist = targetX - (x + CAT_WIDTH / 2);
			direction = dist > 0 ? 1 : -1;
			if (Math.abs(dist) < 24) {
				if (food) {
					food = null;
					fullness = clamp(fullness + 25, 0, 100);
					happiness = clamp(happiness + 10, 0, 100);
					setState('eating', 1800);
					spawnHearts('😋');
				} else {
					// Bat the ball away
					const ball = balls.find((b) => Math.abs(b.x - (x + CAT_WIDTH / 2)) < 40);
					if (ball) {
						ball.vx = direction * (0.25 + Math.random() * 0.2);
						ball.vy = -0.15 - Math.random() * 0.1;
						happiness = clamp(happiness + 5, 0, 100);
					}
					targetX = null;
					setState('happy', 800);
				}
			} else {
				x += direction * CHASE_SPEED * dt;
			}
		} else if (state === 'walking') {
			x += direction * WALK_SPEED * dt;
			if (stateTimer <= 0) pickIdleBehavior();
		} else if (
			stateTimer <= 0 &&
			(state === 'idle' || state === 'eating' || state === 'happy' || state === 'sleeping')
		) {
			pickIdleBehavior();
		}

		// Keep cat on screen
		if (x < 8) {
			x = 8;
			direction = 1;
		} else if (x > viewportWidth - CAT_WIDTH - 8) {
			x = viewportWidth - CAT_WIDTH - 8;
			direction = -1;
		}

		// Slowly get hungry / bored
		fullness = clamp(fullness - dt * 0.0006, 0, 100);
		happiness = clamp(happiness - dt * 0.0004, 0, 100);

		rafId = requestAnimationFrame(tick);
	};

	const spawnHearts = (emoji = '💕') => {
		const newHearts: Heart[] = Array.from({ length: 3 }, (_, i) => ({
			id: nextId++,
			x: x + 10 + i * 18,
			emoji
		}));
		hearts = [...hearts, ...newHearts];
		setTimeout(() => {
			const ids = new Set(newHearts.map((h) => h.id));
			hearts = hearts.filter((h) => !ids.has(h.id));
		}, 1400);
	};

	const petCat = () => {
		if (state === 'sleeping') {
			setState('idle', 1000);
		} else {
			happiness = clamp(happiness + 15, 0, 100);
			setState('happy', 1500);
			spawnHearts('💕');
		}
		showMenu = !showMenu;
	};

	const feedCat = () => {
		food = { x: clamp(x + direction * 160 + CAT_WIDTH / 2, 40, viewportWidth - 40) };
		showMenu = false;
	};

	const throwBall = () => {
		const dir = Math.random() < 0.5 ? -1 : 1;
		balls = [
			...balls.slice(-2),
			{
				id: nextId++,
				x: clamp(x + CAT_WIDTH / 2, 40, viewportWidth - 40),
				y: 80,
				vx: dir * (0.3 + Math.random() * 0.25),
				vy: -0.1,
				color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)]
			}
		];
		showMenu = false;
	};

	const onResize = () => {
		viewportWidth = window.innerWidth;
	};

	onMount(() => {
		viewportWidth = window.innerWidth;
		x = Math.random() * (viewportWidth - CAT_WIDTH - 100) + 50;
		window.addEventListener('resize', onResize);
		rafId = requestAnimationFrame(tick);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(rafId);
		}
	});

	$: mood = state === 'sleeping' ? '💤' : happiness > 70 ? '😺' : happiness > 30 ? '🐱' : '😿';
</script>

<div class="pet-cat-layer" style="--ground: {GROUND_OFFSET}px;">
	{#each balls as ball (ball.id)}
		<div
			class="ball"
			style="left: {ball.x}px; bottom: {GROUND_OFFSET + ball.y}px; background: {ball.color};"
		></div>
	{/each}

	{#if food}
		<div class="food" style="left: {food.x - 12}px;">🐟</div>
	{/if}

	{#each hearts as heart (heart.id)}
		<div class="heart" style="left: {heart.x}px;">{heart.emoji}</div>
	{/each}

	{#if showMenu}
		<div class="menu" style="left: {clamp(x - 30, 8, viewportWidth - 140)}px;">
			<button class="menu-btn" on:click={feedCat} title="Feed the cat">🐟 Feed</button>
			<button class="menu-btn" on:click={throwBall} title="Throw a ball">⚽ Play</button>
			<div class="stats">
				<div class="stat">
					<span>😻</span>
					<div class="bar"><div class="fill happy-fill" style="width: {happiness}%"></div></div>
				</div>
				<div class="stat">
					<span>🍽️</span>
					<div class="bar"><div class="fill full-fill" style="width: {fullness}%"></div></div>
				</div>
			</div>
		</div>
	{/if}

	<button
		class="cat {state}"
		class:flipped={direction === -1}
		style="left: {x}px;"
		on:click={petCat}
		title="Pet me!"
		aria-label="Pet the cat"
	>
		<div class="cat-body">
			<div class="tail"></div>
			<div class="torso"></div>
			<div class="head">
				<div class="ear ear-l"></div>
				<div class="ear ear-r"></div>
				<div class="face">
					{#if state === 'sleeping'}
						<span class="eyes">˘ ˘</span>
					{:else if state === 'happy' || state === 'eating'}
						<span class="eyes">^ ^</span>
					{:else}
						<span class="eyes">• •</span>
					{/if}
					<span class="nose">ω</span>
				</div>
			</div>
			<div class="leg leg-1"></div>
			<div class="leg leg-2"></div>
			<div class="leg leg-3"></div>
			<div class="leg leg-4"></div>
		</div>
		<div class="mood-bubble">{mood}</div>
	</button>
</div>

<style>
	.pet-cat-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 9999;
		overflow: hidden;
	}

	.cat {
		position: absolute;
		bottom: var(--ground);
		width: 64px;
		height: 48px;
		pointer-events: auto;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25));
	}

	.cat.flipped .cat-body {
		transform: scaleX(-1);
	}

	.cat-body {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.torso {
		position: absolute;
		bottom: 6px;
		left: 6px;
		width: 42px;
		height: 22px;
		background: #4a4a4a;
		border-radius: 12px 10px 10px 12px;
	}

	.head {
		position: absolute;
		bottom: 16px;
		right: 0;
		width: 26px;
		height: 24px;
		background: #4a4a4a;
		border-radius: 50% 50% 45% 45%;
	}

	.ear {
		position: absolute;
		top: -7px;
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-bottom: 10px solid #4a4a4a;
	}

	.ear-l {
		left: 1px;
		transform: rotate(-12deg);
	}

	.ear-r {
		right: 1px;
		transform: rotate(12deg);
	}

	.face {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 8px;
		line-height: 1;
		gap: 1px;
	}

	.eyes {
		letter-spacing: 2px;
	}

	.nose {
		font-size: 7px;
		color: #f9a8d4;
	}

	.tail {
		position: absolute;
		bottom: 18px;
		left: -4px;
		width: 16px;
		height: 6px;
		background: #4a4a4a;
		border-radius: 4px;
		transform-origin: right center;
		transform: rotate(35deg);
		animation: tail-sway 1.6s ease-in-out infinite;
	}

	.leg {
		position: absolute;
		bottom: 0;
		width: 6px;
		height: 10px;
		background: #4a4a4a;
		border-radius: 0 0 3px 3px;
	}

	.leg-1 {
		left: 9px;
	}
	.leg-2 {
		left: 18px;
	}
	.leg-3 {
		left: 32px;
	}
	.leg-4 {
		left: 41px;
	}

	.cat.walking .leg-1,
	.cat.chasing .leg-1,
	.cat.walking .leg-3,
	.cat.chasing .leg-3 {
		animation: leg-step 0.3s ease-in-out infinite;
	}

	.cat.walking .leg-2,
	.cat.chasing .leg-2,
	.cat.walking .leg-4,
	.cat.chasing .leg-4 {
		animation: leg-step 0.3s ease-in-out infinite 0.15s;
	}

	.cat.chasing .leg {
		animation-duration: 0.18s;
	}

	.cat.happy .cat-body,
	.cat.eating .cat-body {
		animation: bounce 0.5s ease-in-out infinite;
	}

	.cat.sleeping {
		opacity: 0.85;
	}

	.cat.sleeping .tail {
		animation: none;
		transform: rotate(5deg);
	}

	.mood-bubble {
		position: absolute;
		top: -18px;
		right: -4px;
		font-size: 13px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.cat:hover .mood-bubble,
	.cat.happy .mood-bubble,
	.cat.sleeping .mood-bubble {
		opacity: 1;
	}

	.ball {
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		box-shadow:
			inset -3px -3px 4px rgba(0, 0, 0, 0.25),
			0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.food {
		position: absolute;
		bottom: var(--ground);
		font-size: 20px;
		animation: wiggle 0.8s ease-in-out infinite;
	}

	.heart {
		position: absolute;
		bottom: 56px;
		font-size: 16px;
		animation: float-up 1.4s ease-out forwards;
		pointer-events: none;
	}

	.menu {
		position: absolute;
		bottom: 64px;
		pointer-events: auto;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 120px;
	}

	:global(.dark) .menu {
		background: rgba(38, 38, 38, 0.95);
		border-color: rgba(255, 255, 255, 0.1);
		color: #eee;
	}

	.menu-btn {
		font-size: 13px;
		padding: 4px 8px;
		border-radius: 8px;
		text-align: left;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.menu-btn:hover {
		background: rgba(0, 0, 0, 0.07);
	}

	:global(.dark) .menu-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 4px 8px 2px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
	}

	.bar {
		flex: 1;
		height: 5px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 3px;
		overflow: hidden;
	}

	:global(.dark) .bar {
		background: rgba(255, 255, 255, 0.15);
	}

	.fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s;
	}

	.happy-fill {
		background: #f472b6;
	}

	.full-fill {
		background: #fbbf24;
	}

	@keyframes tail-sway {
		0%,
		100% {
			transform: rotate(35deg);
		}
		50% {
			transform: rotate(15deg);
		}
	}

	@keyframes leg-step {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(-8deg);
		}
		50% {
			transform: rotate(8deg);
		}
	}

	@keyframes float-up {
		0% {
			transform: translateY(0);
			opacity: 1;
		}
		100% {
			transform: translateY(-50px);
			opacity: 0;
		}
	}
</style>
