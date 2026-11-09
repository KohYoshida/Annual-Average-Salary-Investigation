
<script>
  let {
    value = $bindable('100人以上'),
    rankingOrder = $bindable('top')
  } = $props();
</script>

<section class="controls">
  <label>
    ランキング
    <select bind:value={rankingOrder}>
      <option value="top">上位30社</option>
      <option value="bottom">下位30社</option>
    </select>
  </label>

  <label>
    従業員数
    <select bind:value>
      <option value="制限なし">制限なし</option>
      {#each [100, 200, 300, 400, 500] as n}
        <option value={`${n}人以上`}>{n}人以上</option>
      {/each}
    </select>
  </label>
</section>

<style>
  .controls {
    background: white;
    border: 1px solid #dce5ed;
    border-radius: 10px;
    padding: 22px;
    display: flex;
    align-items: end;
    gap: 20px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 9px;
    font-size: 13px;
    font-weight: 700;
  }

  select {
    min-width: 260px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: white;
    font-size: 14px;
  }

  @media (max-width: 700px) {
    select {
      min-width: 220px;
    }
  }
</style>
