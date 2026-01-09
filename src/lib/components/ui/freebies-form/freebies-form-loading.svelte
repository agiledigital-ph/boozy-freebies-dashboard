<script>

	import { Skeleton } from "../skeleton";

</script>
<div class="container p-10 space-y-4">
  <Skeleton class="h-4 w-[100px]" />
  <hr />
  <div class="h-[600px] sm:max-w-[350px] md:max-w-[768px] lg::max-w-[1024px] xl::max-w-[1280px] 2xl:max-w-[1536px] rounded-md border p-4">
    <div class="m-2 mt-5">
      <Skeleton class="h-8 w-[600px]" />
    </div>
    <div class="m-2 mt-5">
      <Skeleton class="h-8 w-[300px]" />
    </div>
    <div class="m-2 mt-5 flex">
      <Skeleton class="h-8 w-[300px]" />
      <Skeleton class="h-8 ml-2 w-[100px]" />
    </div>
    <div class="m-2 mt-5 flex">
      <Skeleton class="h-8 w-[300px]" />
      <Skeleton class="h-8  ml-2 w-[100px]" />
    </div>
    <div class="m-2 mt-5 flex">
      <Skeleton class="h-8 w-[150px]" />
      <Skeleton class="h-8 mx-2   w-[150px]" />
      <Skeleton class="h-8 w-[150px]" />
    </div>
    <div class="m-2 mt-5">
      <Skeleton class="h-8 w-[70px]" />
    </div>
  </div>
</div>