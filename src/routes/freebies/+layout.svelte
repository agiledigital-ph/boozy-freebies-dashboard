<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { ListIcon } from 'lucide-svelte';
	import Logout from 'lucide-svelte/icons/log-out';
	import Menu from 'lucide-svelte/icons/menu';
	import Package2 from 'lucide-svelte/icons/package-2';
	const freebiesHref = '/freebies';
</script>

<div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
	<div class="logo-box hidden border-r bg-muted/40 md:block">
		<div class="flex h-full max-h-screen flex-col gap-2">
			<div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
				<a href="/freebies" class="flex items-center gap-2 font-semibold">
					<Package2 class="h-6 w-6" />
					<span class="">Boozy</span>
				</a>
			</div>
			<div class="flex-1 pt-4">
				<nav class="grid items-start px-2 text-sm font-medium lg:px-4">
					<a
						href={freebiesHref}
						class="nav-link flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
						class:active={$page.url.pathname === freebiesHref}
					>
						<ListIcon class="h-4 w-4" />
						Freebies
					</a>
				</nav>
			</div>
		</div>
	</div>
	<div class="header-box flex flex-col">
		<header class="flex h-[60px] items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
						<Menu class="h-5 w-5" />
						<span class="sr-only">Toggle navigation menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="flex flex-col">
					<nav class="grid gap-2 text-lg font-medium">
						<a href="##" class="flex items-center gap-2 text-lg font-semibold">
							<Package2 class="h-6 w-6" />
							<span class="sr-only">Boozy</span>
						</a>
						<a
							href="/freebies"
							class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
						>
							<ListIcon class="h-4 w-4" />
							Freebies
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<div class="flex w-full justify-end">
				<form action="?logout" method="post">
					<Button type="submit" variant="outline" size="sm" class="ml-auto gap-1.5 text-sm">
						<Logout class="size-3.5" />
						<span class="sr-only">Logout user</span>
						Log out
					</Button>
				</form>
			</div>
		</header>
		<main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6">
			<slot />
		</main>
	</div>
</div>

<style>
	a.nav-link.active {
		color: hsl(var(--primary) / var(--tw-text-opacity));
	}
</style>
