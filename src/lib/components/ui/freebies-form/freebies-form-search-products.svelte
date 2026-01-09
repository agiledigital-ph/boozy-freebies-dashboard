<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import Label from "$lib/components/ui//label/label.svelte";
  import Input from "$lib/components/ui//input/input.svelte";
  import * as Pagination from "$lib/components/ui/pagination";
  import * as Card from "../card";
	import { productStore } from "$lib/stores/productsStore";
  import { Button } from "$lib/components/ui/button/index.js";
	import { formatId } from "$lib/utils";
	import FreebiesFormSearchProductsCard from "./freebies-form-search-products-card.svelte";

  export let freebieData;

  let selectedProducts: any;
  let searchedProducts: string = "";
  let products: any;
  let hasNextPage: boolean = false;
  let hasPreviousPage: boolean = false;
  let startCursor: string | null = null;
  let endCursor: string | null = null;
  let isNext: boolean = true;

  if(freebieData){
    productStore.update(() => freebieData.products);
  }

  productStore.subscribe((data)=>{
    selectedProducts = data;
  })

  const searchProducts = async () => {
    if(searchedProducts) {
      const data = {
          searchTxt: searchedProducts,
          cursor: isNext ? endCursor : startCursor,
          isNext: true
      }
      const response = await fetch('/api/shopify/products', {
          method: 'POST',
          body: JSON.stringify(data)
      });
      const prodJson = await response.json();
      
      if(prodJson && prodJson.products.length){
        products = prodJson.products
        hasNextPage = prodJson.pageInfo.hasNextPage;
        hasPreviousPage = prodJson.pageInfo.hasPreviousPage;
        startCursor = prodJson.pageInfo.startCursor;
        endCursor = prodJson.pageInfo.endCursor;
      }  
    }
  }

  const removeSelectedProducts = (data: any) => {
    selectedProducts = selectedProducts.filter((item: any)  => item.id !== data.id);

    productStore.update(() => selectedProducts);
    console.log("selectedProducts", selectedProducts);
  }
</script>
<Dialog.Root>
  <Label for="name">Search Product</Label>
  <div class="flex w-3/4 max-w-sm items-center space-x-2">
    <Input type="text" placeholder="Search Product" bind:value={searchedProducts} />
    <Dialog.Trigger><Button type="button" on:click={()=>{
        isNext = true;
        startCursor = null;
        endCursor = null;
        searchProducts()
      }}>Search </Button></Dialog.Trigger>
  </div>
  {#if products && products.length }  
    <Dialog.Content class="sm:max-w-[425px] lg:max-w-[760px] lg:max-w-[1024px] xl:max-w-[1224px]">
      <h3>Select Products To Add Freebies</h3>
      <div class="mt-4 grid grid-cols-1 border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5  p-2">
        {#each products as product }
          <div class="">
            <FreebiesFormSearchProductsCard id={formatId(product.id)} name={product.title} img_url={product.featuredImage && product.featuredImage.url != null ? product.featuredImage.url :'none'} productType={product.productType} sku={product.variants.nodes[0].sku}/>
          </div>
        {/each}
      </div>
      <div class="mt-4">
        <Pagination.Root count={1000} perPage={10} let:pages let:currentPage>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.PrevButton on:click={()=>{
                isNext = false;
                searchProducts();
              }}/>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.NextButton  on:click={()=>{
                isNext = true;
                searchProducts();
              }}/>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination.Root>
      </div>
    </Dialog.Content>
  {/if}
</Dialog.Root>
{#if selectedProducts.length}
  <div class="mt-2">
    <h3>Selected Products</h3>
    <div class="mt-4 grid grid-cols-1 border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5  p-2">
      {#each selectedProducts as product }
      <Card.Root>
        <Card.Header class="min-h-[170px]">
          <img src={product.img_url} height="150"  alt={ name + '-img' }/>
        </Card.Header>
        <Card.Content class="min-h-[100px]">
          <Card.Title>{product.name}</Card.Title>
          <Card.Description>{product.sku}</Card.Description>
        </Card.Content>
        <Card.Footer>
          <button class="btn p-2 rounded bg-destructive" on:click={() => {
            removeSelectedProducts({   
              id: product.id
            })
          }} >Remove</button>
        </Card.Footer>
      </Card.Root>
      {/each}
    </div> 
  </div>
{/if}