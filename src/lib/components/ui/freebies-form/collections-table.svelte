<script lang="ts">
	import type { ResourceItem } from '$lib/stores/freebieFormStore';
	import { Badge } from '../badge';
	import * as Card from '../card';
	import * as Table from '../table';
	export let collection: ResourceItem;
	export let productCount: number | undefined;
</script>

<Card.Root class="m-2 w-[500px]">
	<Card.Header>
		<Card.Title class="text-md flex items-center">
			<span>Selected Collection</span>
		</Card.Title>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Collection</Table.Head>
						<Table.Head>Product Count</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell>{collection.name}</Table.Cell>
						<Table.Cell><Badge>{productCount}</Badge></Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Header>
</Card.Root>
