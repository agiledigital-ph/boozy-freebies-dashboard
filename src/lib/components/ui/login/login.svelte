<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { loginFormSchema, type LoginFormSchema } from '$lib/schema/loginSchema';
	import Reload from 'svelte-radix/Reload.svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<LoginFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(loginFormSchema)
	});

	const { form: formData } = form;
	let formLoading = false;
</script>

<form
	method="POST"
	use:enhance={() => {
		formLoading = true;
		return async ({ update }) => {
			formLoading = false;
			update();
		};
	}}
>
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>Email</Form.Label>
					<Input
						{...attrs}
						id="email"
						type="email"
						placeholder="m@example.com"
						bind:value={$formData.email}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>Password</Form.Label>
					<Input {...attrs} id="password" type="password" bind:value={$formData.password} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer>
			<Form.Button class="w-full">
				{#if formLoading}
					<Reload class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					Submit
				{/if}
			</Form.Button>
		</Card.Footer>
	</Card.Root>
</form>
