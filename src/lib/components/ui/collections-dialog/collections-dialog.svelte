<script lang="ts">
	import { freebieFormStore, type FreebieFormState } from '$lib/stores/freebieFormStore';
	import { cn } from '$lib/utils';
	import { Check, Search } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import * as Command from '../command';
	import { Input } from '../input';
	let isDialogOpen: boolean = false;
	let unsubscribeFreebieForm: Unsubscriber;
	let startCursor: string | null = null;
	let endCursor: string | null = null;
	let isNext: boolean = true;
	let selectedCollection: string = '';

	onMount(() => {
		unsubscribeFreebieForm = freebieFormStore.subscribe((currentState: FreebieFormState) => {
			const { isCollectionDialogOpen } = currentState;
			isDialogOpen = isCollectionDialogOpen;
		});
	});

	onDestroy(() => {
		if (unsubscribeFreebieForm) {
			unsubscribeFreebieForm();
		}
	});

	let timer: string | number | NodeJS.Timeout | undefined;

	const debounce = (v: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => searchCollection(v), 1000);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			freebieFormStore.closeDialog('collections');
		}
	};

	const searchCollection = async (searchQuery: string) => {
		const data = {
			searchTxt: searchQuery,
			cursor: isNext ? endCursor : startCursor,
			isNext: true
		};
		const response = await fetch('/api/shopify/collections', {
			method: 'POST',
			body: JSON.stringify(data)
		});

		const collectionData = await response.json();
		console.log({ collectionData });

		if (collectionData.collections.length > 0) {
			freebieFormStore.setCollections(collectionData.collections);
		}
	};
</script>

<Command.Dialog open={isDialogOpen} onOpenChange={handleOpenChange} shouldFilter={false}>
	<!-- <Command.Input placeholder="Type a command or search..." /> -->
	<div class="flex items-center border-b px-2" data-cmdk-input-wrapper="">
		<Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
		<Input
			type="search"
			placeholder="Search collections..."
			class="w-full appearance-none border-none border-transparent bg-background px-0 shadow-none outline-none focus:border-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
			on:keyup={({ currentTarget }) => debounce(currentTarget?.value)}
		/>
	</div>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Suggestions">
			{#each $freebieFormStore.collections as collection}
				<Command.Item
					value={collection.name}
					onSelect={(currentValue) => {
						selectedCollection = currentValue;
						freebieFormStore.selectCollection(currentValue);
						freebieFormStore.closeDialog('collections');
					}}
				>
					<Check
						class={cn('mr-2 h-4 w-4', selectedCollection !== collection.name && 'text-transparent')}
					/>
					{collection.name}
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
