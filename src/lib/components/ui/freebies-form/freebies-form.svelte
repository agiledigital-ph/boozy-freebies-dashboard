<script lang="ts">
	import Input from '$lib/components/ui//input/input.svelte';
	import Label from '$lib/components/ui//label/label.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CollectionsDialog } from '$lib/components/ui/collections-dialog';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import {
		freebieFormStore,
		type FreebieFormState,
		type ResourceItem,
		type ResourceType
	} from '$lib/stores/freebieFormStore';
	import type { Freebie } from '$lib/stores/freebiesPageStore';
	import { freebieStore, productStore } from '$lib/stores/productsStore';
	import { cn } from '$lib/utils.js';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		type DateValue
	} from '@internationalized/date';
	import axios from 'axios';
	import type { DateRange } from 'bits-ui';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Unsubscriber } from 'svelte/store';
	import * as Card from '../card';
	import { FreebiesDialog } from '../freebies-dialog';
	import { ProductsDialog } from '../products-dialog';
	import { Toaster } from '../sonner';
	import { Switch } from '../switch';
	import CollectionsTable from './collections-table.svelte';
	import FreebiesFormLoading from './freebies-form-loading.svelte';
	import ProductsTable from './products-table.svelte';
	import moment from 'moment';

	export let freebieData: Freebie | undefined = undefined;
	const url = import.meta.env.VITE_BOOZY_FREEBIE_API_URL;

	let btnAction: string = freebieData ? 'update' : 'create';
	let isLoading: boolean = false;

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});

	const getYearMonDay = (d: string, date: any) => {
		const opt = date.split('-');
		return d == 'year' ? parseInt(opt[0]) : d == 'month' ? parseInt(opt[1]) : parseInt(opt[2]);
	};

	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;
	const day = today.getDate();

	let value: DateRange = {
		start: freebieData
			? new CalendarDate(
					getYearMonDay('year', freebieData.startDate),
					getYearMonDay('month', freebieData.startDate),
					getYearMonDay('day', freebieData.startDate)
				)
			: new CalendarDate(year, month, day),
		end: freebieData
			? new CalendarDate(
					getYearMonDay('year', freebieData.endDate),
					getYearMonDay('month', freebieData.endDate),
					getYearMonDay('day', freebieData.endDate)
				)
			: new CalendarDate(year, month, day).add({ days: 20 })
	};

	let startValue: DateValue | undefined = undefined;

	let freebieName: string = freebieData ? freebieData.name : '';
	let minAmount: number = freebieData ? freebieData.minAmount : 0;
	let minProduct: number = freebieData ? freebieData.minAmount > 0 ? 0 : freebieData.minProd : 0;
	let maxGift: number = freebieData ? freebieData.maxGift : 0;
	let freebieStatus: boolean = freebieData ? freebieData.status : false;
	let selectedProducts: ResourceItem[];
	let searchedProducts: string = '';

	let selectedFreebies: any;
	let searchedFreebies: string = '';
	let unsubscribeProductsDialog: Unsubscriber;

	onMount(() => {
		if (freebieData) {
			const resourceType: ResourceType = freebieData.products[0].type;
			freebieFormStore.setResourceType(resourceType);
			if (resourceType === 'collections') {
				freebieFormStore.setSelectedCollection(freebieData.products[0]);
			} else {
				freebieFormStore.setSelectedProducts(freebieData.products);
			}

			freebieFormStore.setSelectedFreebies(freebieData.giftItems);
		}

		if (btnAction == 'create') {
			freebieFormStore.setSelectedCollection(undefined);
			freebieFormStore.setSelectedProducts(undefined);
			freebieFormStore.setSelectedFreebies(undefined);
		}

		unsubscribeProductsDialog = freebieFormStore.subscribe((currentState: FreebieFormState) => {
			const {
				selectedProducts: _selectedProducts,
				selectedFreebies: _selectedFreebies,
				selectedCollection,
				resourceType
			} = currentState;
			if (selectedCollection && resourceType === 'collections') {
				selectedProducts = [{ ...selectedCollection }];
			} else if (_selectedProducts && resourceType === 'products') {
				selectedProducts = _selectedProducts;
			}

			if (_selectedFreebies && _selectedFreebies.length > 0) {
				selectedFreebies = _selectedFreebies;
			}
		});
	});

	onDestroy(() => {
		if (unsubscribeProductsDialog) {
			unsubscribeProductsDialog();
		}
	});

	freebieStore.subscribe((data) => {
		selectedFreebies = data;
	});

	productStore.subscribe((data) => {
		selectedProducts = data;
	});

	const convertDate = (input: string): string => {
		const months: { [key: string]: string } = {
			Jan: '01',
			Feb: '02',
			Mar: '03',
			Apr: '04',
			May: '05',
			Jun: '06',
			Jul: '07',
			Aug: '08',
			Sep: '09',
			Oct: '10',
			Nov: '11',
			Dec: '12'
		};

		const [month, day, year] = input.split(' ');
		const formattedMonth = months[month];
		const formattedDay = day.replace(',', '').padStart(2, '0');

		return `${year}-${formattedMonth}-${formattedDay}`;
	};

	const resetData = () => {
		freebieName = '';
		searchedProducts = '';
		searchedFreebies = '';
		minAmount = 0;
		minProduct = 0;
		maxGift = 0;
		value = {
			start: new CalendarDate(year, month, day),
			end: new CalendarDate(year, month, day).add({ days: 20 })
		};
		freebieStore.update(() => []);
		productStore.update(() => []);
		freebieFormStore.setSelectedCollection(undefined);
		freebieFormStore.setSelectedProducts(undefined);
		freebieFormStore.setSelectedFreebies(undefined);
	};

	const saveFreebie = async () => {
		const startDate = convertDate(df.format(value.start!.toDate(getLocalTimeZone())));
		const endDate = convertDate(df.format(value.end!.toDate(getLocalTimeZone())));

		if (
			!moment(startDate).isSameOrAfter(new Date().toISOString().split('T')[0]) &&
			btnAction == 'create'
		) {
			return toast.error('There was an error!', {
				description: 'Please check the starting date of the promo.'
			});
		}

		if (freebieName.trim() == '') {
			return toast.error('There was an error!', {
				description: 'Please add a freebie name.'
			});
		}

		if (selectedFreebies.length == 0) {
			return toast.error('There was an error!', {
				description: 'Please add a freebie.'
			});
		}

		if (selectedProducts.length == 0) {
			return toast.error('There was an error!', {
				description: 'Please add a product.'
			});
		}

		if (freebieName && selectedFreebies.length && selectedProducts.length) {
			isLoading = true;
			console.log({ maxGift });
			let data: {} = {
				name: freebieName,
				min_amount: Number(minAmount) > 0 ? Number(minAmount) : 0,
				min_prod: Number(minProduct) > 1 ? Number(minProduct) : 1,
				max_gift: Number(maxGift) > 1 ? Number(maxGift) : 1,
				start_date: startDate,
				end_date: endDate,
				products: selectedProducts,
				gift_items: selectedFreebies.map((gift: any) => {
					return {
						id: gift.id,
						name: gift.name,
						img_url: gift.img_url,
						variant_id: gift.variant_id
					};
				}),
				created_date: Date.now(),
				updated_date: Date.now()
			};

			let action = '/createPromo';
			let message = 'was successfully created.';
			let toastTitle = 'Freebie Created!';

			if (freebieData) {
				data = {
					...data,
					id: freebieData.docId,
					status: freebieStatus,
					updated_date: Date.now()
				};
				action = '/updatePromo';
				message = 'was successfully updated.';
				toastTitle = 'Freebie Updated!';
			}
			console.log('data', data);
			const result = await axios.post(url + action, data);

			resetData();

			toast.success(toastTitle, {
				description: `${freebieName} ${message}`
			});

			console.log('Result', result);
			isLoading = false;
		}
	};

	const handleRemoveProduct = (event: any) => {
		console.log(`event.detail.name: ${event.detail.name}`);
		freebieFormStore.removeProduct(event.detail.name);
	};

	const handleRemoveFreebie = (event: any) => {
		console.log(`event.detail.name: ${event.detail.name}`);
		freebieFormStore.removeFreebie(event.detail.name);
	};

	const handleDisableStatus = () => {
		const endDate = convertDate(df.format(value.end!.toDate(getLocalTimeZone())));
		const isBeforeEndDate = moment(endDate).isBefore(new Date().toISOString().split('T')[0]);
		const isSameDate = moment(endDate).isSame(new Date().toISOString().split('T')[0]);

		if (isBeforeEndDate) {
			return true;
		}

		if (isSameDate) {
			return false;
		}
	};
</script>

<Toaster />

{#if isLoading}
	<FreebiesFormLoading />
{:else}
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center">
				<span>{btnAction == 'create' ? 'Create' : 'Update'} Freebie</span>
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<ScrollArea class="h-[500px] max-h-[500px]">
				<div class="m-2 flex">
					<div class="w-3/4">
						<Label for="name">Name</Label>
						<Input type="text" bind:value={freebieName} />
					</div>
					{#if freebieData}
						<div class="ml-10 w-1/4">
							<Label for="status" class="w-full">Status</Label>
							<Switch id="status" bind:checked={freebieStatus} disabled={handleDisableStatus()} />
						</div>
					{/if}
				</div>
				<div class="m-2">
					<Label for="name">Date</Label>
					<div class="grid gap-2">
						<Popover.Root openFocus>
							<Popover.Trigger asChild let:builder>
								<Button
									variant="outline"
									class={cn(
										'w-[300px] justify-start text-left font-normal',
										!value && 'text-muted-foreground'
									)}
									builders={[builder]}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{#if value && value.start}
										{#if value.end}
											{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
												value.end.toDate(getLocalTimeZone())
											)}
										{:else}
											{df.format(value.start.toDate(getLocalTimeZone()))}
										{/if}
									{:else if startValue}
										{df.format(startValue.toDate(getLocalTimeZone()))}
									{:else}
										Pick a date
									{/if}
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0" align="start">
								<RangeCalendar
									bind:value
									bind:startValue
									initialFocus
									numberOfMonths={2}
									placeholder={value?.start}
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>

				<div class="m-2">
					<Button
						class="btn capitalize"
						variant="outline"
						on:click={() => freebieFormStore.openDialog('products')}>Add Products</Button
					>
					<Button
						class="btn capitalize"
						variant="outline"
						on:click={() => freebieFormStore.openDialog('collections')}
						>Add Products via Collection</Button
					>
				</div>
				{#if $freebieFormStore.resourceType === 'collections' && $freebieFormStore.selectedCollection}
					<CollectionsTable
						collection={$freebieFormStore.selectedCollection}
						productCount={$freebieFormStore.selectedCollection?.productsCount}
					/>
				{/if}
				{#if $freebieFormStore.resourceType === 'products' && $freebieFormStore.selectedProducts}
					<ProductsTable
						products={$freebieFormStore.selectedProducts}
						on:deleteProduct={handleRemoveProduct}
					/>
				{/if}

				{#if $freebieFormStore.selectedProducts || $freebieFormStore.selectedCollection}
					<Button
						class="btn capitalize"
						variant="outline"
						on:click={() => freebieFormStore.openDialog('freebies')}>Add freebies</Button
					>
				{/if}

				{#if $freebieFormStore.selectedFreebies && $freebieFormStore.selectedFreebies.length > 0}
					<ProductsTable
						products={$freebieFormStore.selectedFreebies}
						on:deleteProduct={handleRemoveFreebie}
					/>
				{/if}

				<div class="m-2 flex">
					<div>
						<Label for="name">Min Amount</Label>
						<Input type="number" bind:value={minAmount} disabled={minProduct > 0} />
					</div>
					<div class="mx-4">
						<Label for="name">Min Product</Label>
						<Input type="number" bind:value={minProduct} disabled={minAmount > 0} />
					</div>
					<div>
						<Label for="name">Max Gift</Label>
						<Input type="number" bind:value={maxGift} />
					</div>
				</div>
				<div class="m-2">
					<Button class="btn capitalize" on:click={saveFreebie}>{btnAction}</Button>
				</div>
			</ScrollArea>
		</Card.Content>
	</Card.Root>
{/if}
<CollectionsDialog />
<ProductsDialog />
<FreebiesDialog />
