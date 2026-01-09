<script lang="ts">
  import { page } from '$app/stores';
	import FreebiesFormLoading from '$lib/components/ui/freebies-form/freebies-form-loading.svelte';
	import FreebiesForm from '$lib/components/ui/freebies-form/freebies-form.svelte';
  import { firestore } from '$lib/firebase/firebase.client';
	import { collection, getDocs, query, where } from 'firebase/firestore';
	import { onMount } from 'svelte';

  $: id = $page.params.id;
	let freebies: any[] = [];
	let isLoading: boolean = false;
	onMount(async () => {
		const q = query(collection(firestore, 'freebies'), where('id', '==', id));
		isLoading = true;
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((doc) => {
			const freebie = {
				name: doc.data().name,
        giftItems: doc.data().gift_items,
        products: doc.data().products,
        minAmount: doc.data().min_amount,
        minProd: doc.data().min_prod,
        maxGift: doc.data().max_gift,
				status: doc.data().status,
				startDate: doc.data().start_date,
				endDate: doc.data().end_date,
				docId: doc.id
			};
			freebies.push(freebie);
		});
		isLoading = false;
		console.log("freebies", freebies);
	});
</script>

{#if isLoading}
  <FreebiesFormLoading/>
{:else}
  <FreebiesForm freebieData={freebies[0]}/>
{/if}