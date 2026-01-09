<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ResourceItem } from '$lib/stores/freebieFormStore';
	import { createEventDispatcher } from 'svelte';
	import * as Card from '../card';
	import * as Table from '../table';
	export let products: ResourceItem[];
	const dispatch = createEventDispatcher();
	const removeProduct = (name: string) => {
		dispatch('deleteProduct', { name });
	};
</script>

<Card.Root class="m-2 w-[500px]">
	<Card.Header>
		<Card.Title class="text-md flex items-center">
			<span>Selected Products</span>
		</Card.Title>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Product Name</Table.Head>
						<Table.Head>Action</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each products as product}
						<Table.Row>
							<Table.Cell>{product.name}</Table.Cell>
							<Table.Cell>
								<Button variant="destructive" on:click={() => removeProduct(product.name)}
									>Remove</Button
								>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Header>
</Card.Root>
