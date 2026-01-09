<script lang="ts">
	import { freebieFormStore, type FreebieFormState } from '$lib/stores/freebieFormStore';
	import { cn } from '$lib/utils';
	import { Check, Search } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import * as Command from '../command';
	import { Input } from '../input';
	let isDialogOpen: boolean = false;
	let unsubscribeFreebieFormStore: Unsubscriber;
	let _selectedProducts: string[] = [];

	onMount(() => {
		unsubscribeFreebieFormStore = freebieFormStore.subscribe((currentState: FreebieFormState) => {
			const { isProductDialogOpen, selectedProducts } = currentState;
			if (selectedProducts) {
				_selectedProducts = selectedProducts.map((val) => val.name);
			}
			isDialogOpen = isProductDialogOpen;
		});
	});

	onDestroy(() => {
		if (unsubscribeFreebieFormStore) {
			unsubscribeFreebieFormStore();
		}
	});

	let timer: string | number | NodeJS.Timeout | undefined;

	const debounce = (v: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => searchProducts(v), 1000);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			freebieFormStore.closeDialog('products');
		}
	};

	const searchProducts = async (searchQuery: string) => {
		const response = await fetch(`/api/shopify/products?searchQuery=${searchQuery}&limit=10`);

		const productsData = await response.json();
		console.log({ productsData });

		if (productsData.products.length > 0) {
			freebieFormStore.setProducts(productsData.products);
		}
	};
</script>

<Command.Dialog open={isDialogOpen} onOpenChange={handleOpenChange} shouldFilter={false}>
	<!-- <Command.Input placeholder="Type a command or search..." /> -->
	<div class="flex items-center border-b px-2" data-cmdk-input-wrapper="">
		<Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
		<Input
			type="text"
			placeholder="Search products..."
			class="w-full appearance-none border-none border-transparent bg-background px-0 shadow-none outline-none focus:border-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
			on:keyup={({ currentTarget }) => debounce(currentTarget?.value)}
		/>
	</div>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Suggestions">
			{#each $freebieFormStore.products as product}
				<Command.Item
					value={product.name}
					onSelect={(currentValue) => {
						if (_selectedProducts.includes(currentValue)) {
							return;
						}
						freebieFormStore.selectProduct(currentValue);
					}}
				>
					<Check
						class={cn(
							'mr-2 h-4 w-4',
							!_selectedProducts.includes(product.name) && 'text-transparent'
						)}
					/>
					{product.name}
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
