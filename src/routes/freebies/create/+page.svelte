<script lang="ts">
	import FreebiesForm from '$lib/components/ui/freebies-form/freebies-form.svelte';
	import { freebieFormStore } from '$lib/stores/freebieFormStore';
	import { Toaster } from 'svelte-sonner';
	import type { PageData } from './$types';
	export let data: PageData;
	freebieFormStore.setCollections(data.collections);
	freebieFormStore.setProducts(data.products);
	freebieFormStore.setFreebies(data.freebies);
</script>

<Toaster />
<FreebiesForm />
