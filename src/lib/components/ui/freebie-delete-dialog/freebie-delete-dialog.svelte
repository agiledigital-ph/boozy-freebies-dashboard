<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { deleteFreebieStore, type DeleteFreebieState } from '$lib/stores/deleteFreebieStore';
	import { freebiesFilterStore } from '$lib/stores/freebiesFilterStore';
	import { freebiesPageStore, type Freebie } from '$lib/stores/freebiesPageStore';
	import axios from 'axios';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Unsubscriber } from 'svelte/store';
	let freebie: Freebie;
	let isDialogOpen: boolean = false;
	let unsubscribeDeleteFreebie: Unsubscriber;
	const url = import.meta.env.VITE_BOOZY_FREEBIE_API_URL + '/deletePromo';

	onMount(() => {
		unsubscribeDeleteFreebie = deleteFreebieStore.subscribe((currentState: DeleteFreebieState) => {
			const { freebie: data, isOpen } = currentState;
			isDialogOpen = isOpen;
			if (data) {
				freebie = data;
			}
		});
	});

	onDestroy(() => {
		if (unsubscribeDeleteFreebie) {
			unsubscribeDeleteFreebie();
		}
	});

	const deleteFreebie = async () => {
		freebiesPageStore.seIsLoading(true);
		const res = await axios.post(url, {
			id: freebie.docId
		});
		console.log('res', res);
		toast.success('Freebie Deleted!', {
			description: `${freebie.name} was successfully deleted.`
		});
		await freebiesFilterStore.setFilterBy($freebiesFilterStore.filterBy);
		deleteFreebieStore.close();
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			deleteFreebieStore.close();
		}
	};
</script>

<AlertDialog.Root open={isDialogOpen} onOpenChange={handleOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure you want to delete {freebie.name}?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete to the database.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel on:click={() => deleteFreebieStore.close()}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={deleteFreebie}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
