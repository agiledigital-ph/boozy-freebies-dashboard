<script lang="ts">
	import * as Card from "$lib/components/ui/card";
  import { freebieStore } from "$lib/stores/productsStore";
	import { toast } from "svelte-sonner";
  export let id;
  export let name;
  export let img_url;
  export let productType;
  export let variant_id;
  export let sku;

  let cardFreebieData: any;

  freebieStore.subscribe((data)=>{
    cardFreebieData = data;
  })

  const checkIdExists = (id: number): boolean => {
    return cardFreebieData.some((item: any) => item.id === id);
  }

  let isActive = false;

  const getFreebies = (data: any) => {
    if(!checkIdExists(data.id)){
      cardFreebieData.push(data)
      
      freebieStore.update(() => cardFreebieData);
      console.log("selectedFreebies", cardFreebieData);
      toast.success("Freebie Added", {
        description: `${data.name} was successfully added.`,
      });
    }else{
      toast.success("Freebie Exist!", {
        description: `${data.name} has already exist!`,
      });
    }
  }
</script>
<div class={`p-1 rounded ${isActive ? 'bg-primary text-white' : 'bg-white'}`}>
    <Card.Root>
      <Card.Header class="min-h-[120px]">
        <img src={img_url} height="120"  alt={ name + '-img' }/>
      </Card.Header>
      <Card.Content class="min-h-[100px]">
        <Card.Title>{name}</Card.Title>
        <Card.Description>{sku}</Card.Description>
      </Card.Content>
      <Card.Footer>
        <button class="btn rounded p-2 bg-primary" on:click={(v) => {
          getFreebies({
            id,
            name,
            img_url,
            productType,
            variant_id,
            sku
          })
        }}>Add</button>
      </Card.Footer>
    </Card.Root>
</div>