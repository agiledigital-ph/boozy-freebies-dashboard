<script lang="ts">
	import * as Card from "$lib/components/ui/card";
  import { productStore } from "$lib/stores/productsStore";
  import { toast } from "svelte-sonner";
  export let id;
  export let name;
  export let img_url;
  export let productType;
  export let sku;

  let cardProductsData: any;
  
  productStore.subscribe((data)=>{
    cardProductsData = data;
  })

  let isActive = false;
  let checked = false;

  const checkIdExists = (id: number): boolean => {
    return cardProductsData.some((item: any) => item.id === id);
  }

  isActive = checkIdExists(id);
  checked = checkIdExists(id);

  const getProducts = (data: any) => {
    if(!checkIdExists(data.id)){
      cardProductsData.push(data)
      
      productStore.update(() => cardProductsData);
      console.log("selectedProducts", cardProductsData, productType);
      toast.success("Product Added", {
        description: `${data.name} was successfully added.`,
      });
    }else{
      toast.success("Product Exist!", {
        description: `${data.name} has already exist!`,
      });
    }
  }
</script>
<div class={`p-1 rounded `}>
    <Card.Root>
      <Card.Header class="min-h-[120px]">
        <img src={img_url} height="120" alt={ name + '-img' }/>
      </Card.Header>
      <Card.Content class="min-h-[100px]">
        <Card.Title>{name}</Card.Title>
        <Card.Description>{sku}</Card.Description>
      </Card.Content>
      <Card.Footer>
        <button class="btn rounded p-2 bg-primary" on:click={(v) => {
          getProducts({
            id,
            name,
            img_url,
            type: 'products',
            sku
          })
        }}>Add</button>
      </Card.Footer>
    </Card.Root>
</div>