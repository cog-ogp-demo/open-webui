<script lang="ts">
	import { onMount, getContext } from 'svelte';

	const i18n = getContext('i18n');

	// Primary colors available for mixing
	const PRIMARY_COLORS = [
		{ id: 'red', name: 'Red', hex: '#EF4444', emoji: '🔴' },
		{ id: 'blue', name: 'Blue', hex: '#3B82F6', emoji: '🔵' },
		{ id: 'yellow', name: 'Yellow', hex: '#FACC15', emoji: '🟡' }
	];

	// Color mixing recipes and their real-world examples
	const MIX_RESULTS: Record<
		string,
		{
			name: string;
			hex: string;
			emoji: string;
			objects: { emoji: string; label: string }[];
			message: string;
		}
	> = {
		'blue+red': {
			name: 'Purple',
			hex: '#8B5CF6',
			emoji: '🟣',
			objects: [
				{ emoji: '🍇', label: 'Grapes' },
				{ emoji: '🦄', label: 'Unicorn' },
				{ emoji: '🔮', label: 'Crystal Ball' },
				{ emoji: '🦋', label: 'Butterfly' }
			],
			message: 'You made Purple!'
		},
		'red+yellow': {
			name: 'Orange',
			hex: '#F97316',
			emoji: '🟠',
			objects: [
				{ emoji: '🍊', label: 'Orange' },
				{ emoji: '🥕', label: 'Carrot' },
				{ emoji: '🐅', label: 'Tiger' },
				{ emoji: '🐠', label: 'Clownfish' }
			],
			message: 'You made Orange!'
		},
		'blue+yellow': {
			name: 'Green',
			hex: '#22C55E',
			emoji: '🟢',
			objects: [
				{ emoji: '🐸', label: 'Frog' },
				{ emoji: '🌿', label: 'Leaf' },
				{ emoji: '🐢', label: 'Turtle' },
				{ emoji: '🍀', label: 'Clover' }
			],
			message: 'You made Green!'
		},
		'red+red': {
			name: 'Red',
			hex: '#EF4444',
			emoji: '🔴',
			objects: [
				{ emoji: '🍎', label: 'Apple' },
				{ emoji: '🌹', label: 'Rose' },
				{ emoji: '🐞', label: 'Ladybug' },
				{ emoji: '🍓', label: 'Strawberry' }
			],
			message: "That's still Red!"
		},
		'blue+blue': {
			name: 'Blue',
			hex: '#3B82F6',
			emoji: '🔵',
			objects: [
				{ emoji: '🌊', label: 'Ocean' },
				{ emoji: '🐳', label: 'Whale' },
				{ emoji: '💎', label: 'Diamond' },
				{ emoji: '🫐', label: 'Blueberry' }
			],
			message: "That's still Blue!"
		},
		'yellow+yellow': {
			name: 'Yellow',
			hex: '#FACC15',
			emoji: '🟡',
			objects: [
				{ emoji: '🌻', label: 'Sunflower' },
				{ emoji: '⭐', label: 'Star' },
				{ emoji: '🍋', label: 'Lemon' },
				{ emoji: '🐥', label: 'Chick' }
			],
			message: "That's still Yellow!"
		}
	};

	// Celebration particles configuration
	const PARTICLE_EMOJIS = ['✨', '⭐', '🎉', '🌟', '💫'];

	let selectedColors: string[] = [];
	let mixResult: (typeof MIX_RESULTS)[string] | null = null;
	let showResult = false;
	let showCelebration = false;
	let particles: { id: number; emoji: string; x: number; y: number; delay: number }[] = [];
	let animatingMix = false;

	function selectColor(colorId: string) {
		if (animatingMix) return;

		if (selectedColors.length < 2) {
			selectedColors = [...selectedColors, colorId];
		}

		if (selectedColors.length === 2) {
			mixColors();
		}
	}

	function getMixKey(c1: string, c2: string): string {
		return [c1, c2].sort().join('+');
	}

	function mixColors() {
		animatingMix = true;
		const key = getMixKey(selectedColors[0], selectedColors[1]);
		const result = MIX_RESULTS[key];

		if (result) {
			// Short delay to show the mixing animation
			setTimeout(() => {
				mixResult = result;
				showResult = true;
				triggerCelebration();
				animatingMix = false;
			}, 800);
		}
	}

	function triggerCelebration() {
		showCelebration = true;
		particles = Array.from({ length: 16 }, (_, i) => ({
			id: i,
			emoji: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
			x: Math.random() * 100,
			y: Math.random() * 100,
			delay: Math.random() * 0.5
		}));

		setTimeout(() => {
			showCelebration = false;
			particles = [];
		}, 2500);
	}

	function reset() {
		selectedColors = [];
		mixResult = null;
		showResult = false;
		showCelebration = false;
		particles = [];
		animatingMix = false;
	}

	function getColorById(id: string) {
		return PRIMARY_COLORS.find((c) => c.id === id);
	}
</script>

<div class="color-mixer-game">
	<!-- Celebration particles -->
	{#if showCelebration}
		<div class="celebration-overlay">
			{#each particles as p (p.id)}
				<span class="particle" style="left: {p.x}%; top: {p.y}%; animation-delay: {p.delay}s;">
					{p.emoji}
				</span>
			{/each}
		</div>
	{/if}

	<div class="game-container">
		<!-- Title -->
		<div class="game-header">
			<h1 class="game-title">
				<span class="title-emoji">🎨</span>
				{$i18n.t('Color Mixer')}
				<span class="title-emoji">🖌️</span>
			</h1>
			<p class="game-subtitle">{$i18n.t('Tap two colors to mix them!')}</p>
		</div>

		<!-- Color selection area -->
		{#if !showResult}
			<div class="colors-section">
				<!-- Selected colors display -->
				<div class="selected-area">
					<div class="mix-equation">
						<div
							class="mix-slot"
							class:filled={selectedColors.length >= 1}
							style={selectedColors.length >= 1
								? `background-color: ${getColorById(selectedColors[0])?.hex}; border-color: ${getColorById(selectedColors[0])?.hex};`
								: ''}
						>
							{#if selectedColors.length >= 1}
								<span class="slot-emoji">{getColorById(selectedColors[0])?.emoji}</span>
							{:else}
								<span class="slot-placeholder">?</span>
							{/if}
						</div>

						<span class="mix-operator" class:active={selectedColors.length >= 1}>+</span>

						<div
							class="mix-slot"
							class:filled={selectedColors.length >= 2}
							style={selectedColors.length >= 2
								? `background-color: ${getColorById(selectedColors[1])?.hex}; border-color: ${getColorById(selectedColors[1])?.hex};`
								: ''}
						>
							{#if selectedColors.length >= 2}
								<span class="slot-emoji">{getColorById(selectedColors[1])?.emoji}</span>
							{:else}
								<span class="slot-placeholder">?</span>
							{/if}
						</div>

						{#if animatingMix}
							<span class="mix-operator active">=</span>
							<div class="mix-slot mixing">
								<span class="slot-placeholder spinning">🌀</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Primary color buttons -->
				<div class="primary-colors">
					{#each PRIMARY_COLORS as color (color.id)}
						<button
							class="color-btn"
							style="background-color: {color.hex};"
							on:click={() => selectColor(color.id)}
							disabled={animatingMix}
							aria-label={$i18n.t(color.name)}
						>
							<span class="color-emoji">{color.emoji}</span>
							<span class="color-label">{$i18n.t(color.name)}</span>
						</button>
					{/each}
				</div>

				{#if selectedColors.length > 0 && !animatingMix}
					<button class="undo-btn" on:click={reset}>
						<span>↩️</span>
						{$i18n.t('Start Over')}
					</button>
				{/if}
			</div>

			<!-- Result display -->
		{:else if mixResult}
			<div class="result-section">
				<div class="result-card" style="border-color: {mixResult.hex};">
					<div class="result-header">
						<span class="result-emoji bounce">{mixResult.emoji}</span>
						<h2 class="result-title" style="color: {mixResult.hex};">
							{$i18n.t(mixResult.message)}
						</h2>
					</div>

					<div class="result-color-swatch" style="background-color: {mixResult.hex};">
						<span class="swatch-name">{$i18n.t(mixResult.name)}</span>
					</div>

					<p class="result-subtitle">
						{$i18n.t('Look! These things are')}
						<strong style="color: {mixResult.hex};">{$i18n.t(mixResult.name)}</strong>:
					</p>

					<div class="objects-grid">
						{#each mixResult.objects as obj}
							<div class="object-card pop-in">
								<span class="object-emoji">{obj.emoji}</span>
								<span class="object-label">{$i18n.t(obj.label)}</span>
							</div>
						{/each}
					</div>
				</div>

				<button class="try-again-btn" on:click={reset}>
					<span>🎨</span>
					{$i18n.t('Mix Again!')}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.color-mixer-game {
		position: relative;
		width: 100%;
		min-height: 100%;
		display: flex;
		justify-content: center;
		padding: 1rem;
		overflow: hidden;
		background: linear-gradient(
			135deg,
			#fef3c7 0%,
			#fce7f3 25%,
			#dbeafe 50%,
			#d1fae5 75%,
			#fef9c3 100%
		);
	}

	:global(.dark) .color-mixer-game {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
	}

	.game-container {
		max-width: 600px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding-bottom: 2rem;
	}

	/* Header */
	.game-header {
		text-align: center;
		padding: 1rem 0;
	}

	.game-title {
		font-size: 2.25rem;
		font-weight: 800;
		color: #1f2937;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
		margin: 0;
	}

	:global(.dark) .game-title {
		color: #f9fafb;
	}

	.title-emoji {
		font-size: 2rem;
		animation: wiggle 2s ease-in-out infinite;
	}

	.game-subtitle {
		font-size: 1.25rem;
		color: #6b7280;
		margin-top: 0.5rem;
		font-weight: 500;
	}

	:global(.dark) .game-subtitle {
		color: #9ca3af;
	}

	/* Colors Section */
	.colors-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	/* Mix equation display */
	.selected-area {
		width: 100%;
	}

	.mix-equation {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.mix-slot {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 4px dashed #d1d5db;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		background-color: #f3f4f6;
	}

	:global(.dark) .mix-slot {
		border-color: #4b5563;
		background-color: #374151;
	}

	.mix-slot.filled {
		border-style: solid;
		transform: scale(1.05);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	}

	.mix-slot.mixing {
		border: 4px dashed #a78bfa;
		animation: pulse 0.5s ease-in-out infinite;
	}

	.slot-emoji {
		font-size: 2rem;
	}

	.slot-placeholder {
		font-size: 1.75rem;
		color: #9ca3af;
		font-weight: 700;
	}

	.spinning {
		animation: spin 0.8s linear infinite;
	}

	.mix-operator {
		font-size: 2rem;
		font-weight: 800;
		color: #d1d5db;
		transition: color 0.3s;
	}

	:global(.dark) .mix-operator {
		color: #4b5563;
	}

	.mix-operator.active {
		color: #6b7280;
	}

	:global(.dark) .mix-operator.active {
		color: #9ca3af;
	}

	/* Primary color buttons */
	.primary-colors {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.color-btn {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		border: 6px solid rgba(255, 255, 255, 0.5);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		-webkit-tap-highlight-color: transparent;
	}

	.color-btn:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
	}

	.color-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.color-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.color-emoji {
		font-size: 2.5rem;
	}

	.color-label {
		font-size: 1.1rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	/* Undo button */
	.undo-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 9999px;
		border: 2px solid #e5e7eb;
		background: white;
		color: #6b7280;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	:global(.dark) .undo-btn {
		background: #374151;
		border-color: #4b5563;
		color: #9ca3af;
	}

	.undo-btn:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	:global(.dark) .undo-btn:hover {
		background: #4b5563;
	}

	/* Result Section */
	.result-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		animation: fadeInUp 0.5s ease-out;
	}

	.result-card {
		width: 100%;
		background: white;
		border-radius: 1.5rem;
		border: 4px solid;
		padding: 2rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	:global(.dark) .result-card {
		background: #1f2937;
	}

	.result-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.result-emoji {
		font-size: 4rem;
	}

	.result-emoji.bounce {
		animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.result-title {
		font-size: 1.75rem;
		font-weight: 800;
		margin: 0;
		text-align: center;
	}

	.result-color-swatch {
		width: 100%;
		max-width: 200px;
		height: 60px;
		border-radius: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	}

	.swatch-name {
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.result-subtitle {
		font-size: 1.1rem;
		color: #6b7280;
		text-align: center;
		margin: 0;
	}

	:global(.dark) .result-subtitle {
		color: #9ca3af;
	}

	/* Objects grid */
	.objects-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		width: 100%;
	}

	.object-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 1rem;
		transition: transform 0.2s;
	}

	:global(.dark) .object-card {
		background: #374151;
	}

	.object-card:hover {
		transform: scale(1.05);
	}

	.object-card.pop-in {
		animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	}

	.object-card:nth-child(1) {
		animation-delay: 0.1s;
	}
	.object-card:nth-child(2) {
		animation-delay: 0.2s;
	}
	.object-card:nth-child(3) {
		animation-delay: 0.3s;
	}
	.object-card:nth-child(4) {
		animation-delay: 0.4s;
	}

	.object-emoji {
		font-size: 3rem;
	}

	.object-label {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
	}

	:global(.dark) .object-label {
		color: #e5e7eb;
	}

	/* Try again button */
	.try-again-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		border-radius: 9999px;
		border: none;
		background: linear-gradient(135deg, #8b5cf6, #ec4899);
		color: white;
		font-size: 1.25rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
		box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
	}

	.try-again-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
	}

	.try-again-btn:active {
		transform: scale(0.95);
	}

	/* Celebration overlay */
	.celebration-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 50;
	}

	.particle {
		position: absolute;
		font-size: 2rem;
		animation: particleFall 2s ease-out forwards;
	}

	/* Animations */
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-5deg);
		}
		75% {
			transform: rotate(5deg);
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
	}

	@keyframes bounceIn {
		0% {
			transform: scale(0);
		}
		60% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes particleFall {
		0% {
			opacity: 1;
			transform: translateY(-20px) scale(0.5) rotate(0deg);
		}
		50% {
			opacity: 1;
			transform: translateY(40vh) scale(1.2) rotate(180deg);
		}
		100% {
			opacity: 0;
			transform: translateY(80vh) scale(0.3) rotate(360deg);
		}
	}

	/* Responsive */
	@media (max-width: 480px) {
		.game-title {
			font-size: 1.5rem;
		}

		.color-btn {
			width: 100px;
			height: 100px;
		}

		.color-emoji {
			font-size: 1.75rem;
		}

		.color-label {
			font-size: 0.875rem;
		}

		.mix-slot {
			width: 60px;
			height: 60px;
		}

		.slot-emoji {
			font-size: 1.5rem;
		}

		.primary-colors {
			gap: 1rem;
		}

		.objects-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
		}

		.object-emoji {
			font-size: 2.25rem;
		}
	}
</style>
