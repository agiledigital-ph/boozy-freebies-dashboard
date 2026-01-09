<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import Label from "$lib/components/ui//label/label.svelte";
  import Input from "$lib/components/ui//input/input.svelte";
  import * as Pagination from "$lib/components/ui/pagination";
  import * as Card from "../card";
	import { freebieStore } from "$lib/stores/productsStore";
  import { Button } from "$lib/components/ui/button/index.js";
  import FreebiesCard from "$lib/components/ui/freebies-form/freebies-form-search-freebies-card.svelte";
	import { formatId } from "$lib/utils";

  export let freebieData;

  let freebies: any;
  let selectedFreebies: any;
  let searchedFreebies: string = "";

  let hasNextPageFB: boolean = false;
  let hasPreviousPageFB: boolean = false;
  let startCursorFB: string | null = null;
  let endCursorFB: string | null = null;
  let isNextFB: boolean = true;

  if(freebieData){
    freebieStore.update(() => freebieData.giftItems);
  }

  freebieStore.subscribe((data)=>{
    selectedFreebies = data;
  });

  const searchFreebie= async () => {
    if(searchedFreebies) {
      const data = {
          searchTxt: searchedFreebies,
          cursor: isNextFB ? endCursorFB : startCursorFB,
          isNext: isNextFB
      }
      const response = await fetch('/api/shopify/freebies', {
          method: 'POST',
          body: JSON.stringify(data)
      });
      const freebieJson = await response.json();
      
      if(freebieJson && freebieJson.products.length){
          freebies = freebieJson.products
          hasNextPageFB = freebieJson.pageInfo.hasNextPage;
          hasPreviousPageFB = freebieJson.pageInfo.hasPreviousPage;
          startCursorFB = freebieJson.pageInfo.startCursor;
          endCursorFB = freebieJson.pageInfo.endCursor;
        }
      
      console.log("freebies", freebies.products)
    }
  }

  const removeSelectedFreebies = (data: any) => {
    selectedFreebies = selectedFreebies.filter((item: any) => item.id !== data.id);

    freebieStore.update(() => selectedFreebies);
    console.log("selectedFreebies", selectedFreebies);
  }

</script>
<Dialog.Root>
  <Label for="name">Search Freebies</Label>
  <div class="flex w-3/4 max-w-sm items-center space-x-2">
    <Input type="text" placeholder="Search Product" bind:value={searchedFreebies} />
    <Dialog.Trigger><Button type="button" on:click={() => {
        isNextFB = true;
        startCursorFB = null;
        endCursorFB = null;
        searchFreebie();
      }}>Search </Button></Dialog.Trigger>
  </div>
  {#if freebies && freebies.length }
    <Dialog.Content class="sm:max-w-[425px] lg:max-w-[742px] lg:max-w-[1024px]">
      <h3>Select Products To Add Freebies</h3>
      <div class="mt-4 grid grid-cols-1 border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5  p-2">
        {#each freebies as freebie }
          <div class="">
            <FreebiesCard id={formatId(freebie.id)} name={freebie.title} img_url={freebie.featuredImage && freebie.featuredImage.url != null ? freebie.featuredImage.url :'none'} productType={freebie.productType} sku={freebie.variants.nodes[0].sku} variant_id={formatId(freebie.variants.nodes[0].id)}/>
          </div>
        {/each}
      </div>
      <div class="mt-4">
        <Pagination.Root count={1000} perPage={10} let:pages let:currentPage>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.PrevButton on:click={()=>{
                isNextFB = false;
                searchFreebie();
              }}/>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.NextButton  on:click={()=>{
                isNextFB = true;
                searchFreebie();
              }}/>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination.Root>
      </div>
    </Dialog.Content>
  {/if}
</Dialog.Root>
{#if selectedFreebies.length}
  <div class="mt-2">
    <h3>Selected Freebies</h3>
    <div class="mt-4 grid grid-cols-1 border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5  p-2">
      {#each selectedFreebies as freebie }
        <Card.Root>
          <Card.Header class="min-h-[170px]">
            <img src={freebie.img_url} height="150"  alt={ name + '-img' }/>
          </Card.Header>
          <Card.Content class="min-h-[100px]">
            <Card.Title>{freebie.name}</Card.Title>
            <Card.Description>{freebie.sku}</Card.Description>
          </Card.Content>
          <Card.Footer>
            <button class="btn p-2 rounded bg-destructive" on:click={() => {
              removeSelectedFreebies({   
                id: freebie.id
              })
            }} >Remove</button>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div> 
  </div>
{/if}