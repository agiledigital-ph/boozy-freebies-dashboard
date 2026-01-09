<script lang="ts">
	import { FreebiesTable } from '$lib/components/ui/freebies-table';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { freebiesFilterStore, type FreebiesFilterState } from '$lib/stores/freebiesFilterStore';
	import {
		freebiesPageStore,
		type Freebie,
		type FreebiesPageState
	} from '$lib/stores/freebiesPageStore';
	import { searchFreebiesStore, type SearchFreebiesState } from '$lib/stores/searchFreebiesStore';
	import { onDestroy, onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import type { Unsubscriber } from 'svelte/store';

	let isLoading: boolean = false;
	let unsubscribeFreebiesFilter: Unsubscriber;
	let unsubscribeSearchFreebies: Unsubscriber;
	let unsubscribeFreebiesPage: Unsubscriber;
	let freebies: Freebie[] = [];
	let isNoDataFound: boolean = false;

	onMount(async () => {
		unsubscribeFreebiesFilter = freebiesPageStore.subscribe((currentState: FreebiesPageState) => {
			isLoading = currentState.isLoading;
			freebies = currentState.data;
			if (currentState.data.length > 0) {
				isNoDataFound = false;
			}
		});

		unsubscribeFreebiesFilter = freebiesFilterStore.subscribe(
			(currentState: FreebiesFilterState) => {
				freebiesPageStore.fetchFreebies(currentState.filterBy);
			}
		);

		unsubscribeSearchFreebies = searchFreebiesStore.subscribe(
			(currentState: SearchFreebiesState) => {
				if (currentState.query === '') {
					isNoDataFound = false;
					freebies = $freebiesPageStore.data;
				}

				const results = $freebiesPageStore.data.filter((freebie: Freebie) =>
					freebie.name.toLowerCase().includes(currentState.query.toLowerCase())
				);

				if (results.length > 0) {
					isNoDataFound = false;
					freebies = results;
				}

				if (results.length === 0 && currentState.query !== '') {
					isNoDataFound = true;
				}
			}
		);
	});

	onDestroy(() => {
		if (unsubscribeFreebiesFilter) {
			unsubscribeFreebiesFilter();
		}

		if (unsubscribeSearchFreebies) {
			unsubscribeSearchFreebies();
		}

		if (unsubscribeFreebiesPage) {
			unsubscribeFreebiesPage();
		}
	});
</script>

<Toaster />
{#if isLoading}
	<div class="flex items-center space-x-4 pt-4">
		<Skeleton class="h-4 w-[200px]" />
	</div>

	<div class="flex items-center space-x-40 pt-8">
		<Skeleton class="h-4 w-[100px]" />
		<Skeleton class="h-4 w-[100px]" />
		<Skeleton class="h-4 w-[100px]" />
		<Skeleton class="h-4 w-[100px]" />
	</div>
	<hr />
	<Skeleton class="h-4 w-[100%]" />
	<Skeleton class="h-4 w-[100%]" />
	<Skeleton class="h-4 w-[100%]" />
	<Skeleton class="h-4 w-[100%]" />
	<Skeleton class="h-4 w-[100%]" />
	<Skeleton class="h-4 w-[100%]" />
{:else}
	<FreebiesTable data={freebies} {isNoDataFound} />
{/if}
