<script lang="ts">
	import { deleteFreebieStore } from '$lib/stores/deleteFreebieStore';
	import { freebiesFilterStore } from '$lib/stores/freebiesFilterStore';
	import { freebiesPageStore, type Freebie } from '$lib/stores/freebiesPageStore';
	import { freebieStore, productStore } from '$lib/stores/productsStore';
	import { searchFreebiesStore } from '$lib/stores/searchFreebiesStore';
	import axios from 'axios';
	import { CirclePlus, Ellipsis, ListFilter, Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '../button';
	import * as Card from '../card';
	import * as DropdownMenu from '../dropdown-menu';
	import FreebieDeleteDialog from '../freebie-delete-dialog/freebie-delete-dialog.svelte';
	import { Input } from '../input';
	import { ScrollArea } from '../scroll-area';
	import { Switch } from '../switch';
	import * as Table from '../table';
	import moment from 'moment';
	export let data: any[] = [];
	export let isNoDataFound: boolean = false;

	freebieStore.update(() => []);
	productStore.update(() => []);

	let timer: string | number | NodeJS.Timeout | undefined;
	const url = import.meta.env.VITE_BOOZY_FREEBIE_API_URL + '/updatePromo';

	const debounce = (v: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			searchFreebiesStore.setQuery(v);
		}, 750);
	};

	const { open } = deleteFreebieStore;

	const onStatusChange = async (status: boolean, freebie: Freebie) => {
		freebiesPageStore.seIsLoading(true);
		const res = await axios.post(url, {
			id: freebie.id,
			name: freebie.name,
			products: freebie.products,
			gift_items: freebie.giftItems,
			min_amount: freebie.minAmount,
			min_prod: freebie.minProd,
			max_gift: freebie.maxGift,
			start_date: freebie.startDate,
			end_date: freebie.endDate,
			status
		});
		console.log('res', res);
		await freebiesFilterStore.setFilterBy($freebiesFilterStore.filterBy);

		toast.success('Freebie Updated!', {
			description: `${freebie.name} status was successfully updated.`
		});
	};

	const handleDisableStatus = (freebieEndDate: string) => {
		const isBeforeEndDate = moment(freebieEndDate).isBefore(new Date().toISOString().split('T')[0]);
		const isSameDate = moment(freebieEndDate).isSame(new Date().toISOString().split('T')[0]);

		if (isBeforeEndDate) {
			return true;
		}

		if (isSameDate) {
			return false;
		}
	};
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center">
			<span>Freebies</span>

			<div class="ml-auto flex items-center gap-2">
				<div class="relative">
					<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search freebies..."
						class="w-full appearance-none bg-background pl-8 shadow-none"
						on:keyup={({ currentTarget }) => debounce(currentTarget?.value)}
					/>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline" class="h-10 gap-1">
							<ListFilter class="h-3.5 w-3.5" />
							<span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Filter </span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Label>Filter by</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.CheckboxItem
							checked={$freebiesFilterStore.filterBy === 'All' ? true : false}
							on:click={() => freebiesFilterStore.setFilterBy('All')}>All</DropdownMenu.CheckboxItem
						>
						<DropdownMenu.CheckboxItem
							checked={$freebiesFilterStore.filterBy === 'Active' ? true : false}
							on:click={() => freebiesFilterStore.setFilterBy('Active')}
							>Active</DropdownMenu.CheckboxItem
						>
						<DropdownMenu.CheckboxItem
							checked={$freebiesFilterStore.filterBy === 'Draft' ? true : false}
							on:click={() => freebiesFilterStore.setFilterBy('Draft')}
							>Draft</DropdownMenu.CheckboxItem
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Button class="h-10 gap-1" href="freebies/create"
					><CirclePlus class="h-3.5 w-3.5" />
					<span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Create freebie </span></Button
				>
			</div>
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if isNoDataFound}
			<div class="grid h-[500px] max-h-[500px] content-center justify-center">
				<div
					class="grid w-[300px] flex-1 items-center justify-center rounded-lg border border-dashed py-10"
				>
					<h3 class="text-2xl font-bold tracking-tight">No Data Found!</h3>
				</div>
			</div>
		{:else}
			<ScrollArea class="h-[500px] max-h-[500px]">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head class="text-right">Status</Table.Head>
							<Table.Head class="text-right">Start Date</Table.Head>
							<Table.Head class="text-right">End Date</Table.Head>
							<Table.Head class="text-right"></Table.Head>
							<Table.Head>
								<span class="sr-only">Actions</span>
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data as freebie (freebie.docId)}
							<Table.Row>
								<Table.Cell class="max-w-[150px] font-medium">{freebie.name}</Table.Cell>
								<Table.Cell class="max-w-[20px] text-right font-medium">
									<Switch
										onCheckedChange={(status) => onStatusChange(status, freebie)}
										bind:checked={freebie.status}
										disabled={handleDisableStatus(freebie.endDate)}
									/>
								</Table.Cell>
								<Table.Cell class="max-w-[20px] text-right font-medium"
									>{freebie.startDate}</Table.Cell
								>
								<Table.Cell class="max-w-[20px] text-right font-medium"
									>{freebie.endDate}</Table.Cell
								>
								<Table.Cell class="max-w-[20px] text-right"></Table.Cell>
								<Table.Cell class="max-w-[20px] text-right">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger asChild let:builder>
											<Button aria-haspopup="true" size="icon" variant="ghost" builders={[builder]}>
												<Ellipsis class="h-4 w-4" />
												<span class="sr-only">Toggle menu</span>
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Label>Actions</DropdownMenu.Label>
											<DropdownMenu.Item href={`freebies/${freebie.docId}/edit`}
												>Edit</DropdownMenu.Item
											>
											<DropdownMenu.Item on:click={() => open(freebie)}>Delete</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</ScrollArea>
		{/if}
		<FreebieDeleteDialog />
	</Card.Content>
</Card.Root>
