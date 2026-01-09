import { writable } from 'svelte/store';

let data: any = [];
let datap: any = [];

export const freebieStore = writable([]);
export const productStore = writable([]);

$: freebieStore.set(data);
$: productStore.set(datap);
