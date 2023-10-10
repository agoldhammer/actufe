<script lang="ts">
  export let card_id: string;
  export let active_id: string;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="help-card" id={card_id}>
  <div class="help-card-top">
    <!-- next do nothing line to suppress spurious warning -->
    {#if false} <slot />{/if}

    <slot name="topic" />
    <button id={card_id} class="open"> &#10133; </button>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#if active_id === card_id}
    <div class="help-card-btm">
      <div class="desc">
        <slot name="description" />
      </div>
      <button id={card_id} class="close">&#10060;</button>
    </div>
  {/if}
</div>

<style>
  .help-card {
    padding: 8px;
    margin: 8px;
    border-radius: 8px;
    box-shadow: 5px 10px 8px #888888;
  }

  .help-card-top {
    display: grid;
    grid-template-columns: 10fr 1fr;
    color: white;
    background-color: blue;
    border-radius: 8px;
    padding: 8px;
  }

  .help-card-btm {
    display: grid;
    grid-template-columns: 10fr 1fr;
    background-color: rgb(114, 43, 15);
    color: white;
    padding: 12px;
    border-radius: 8px;
  }

  .desc {
    padding: 8px;
  }

  .open,
  .close {
    background-color: white;
    color: red;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px;
  }
</style>
