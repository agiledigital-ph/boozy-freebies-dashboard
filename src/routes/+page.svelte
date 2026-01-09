<script lang="ts">
	import { Login } from '$lib/components/ui/login';
	import type { PageData } from './$types.js';
	export let data: PageData;
</script>

<Login data={data.form} />
