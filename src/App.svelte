
<script>
  import RankingCard from './components/RankingCard.svelte';
  import EmployeeFilter from './components/EmployeeFilter.svelte';
  import { createRankings } from './lib/ranking.js';
  import { companies } from './data/companies.js';
  import RangeChart from './components/RangeChart.svelte';
  import chartCompanies from './data/edinet_chart_2020_2026_sep.json';
  import ScatterChart from './components/ScatterChart.svelte';

  let chartSectors = ['全産業',...new Set(chartCompanies.map(d => d.sector).filter(Boolean))];
  let chartEmployeeCondition = $state('100人以上');
  let chartMode = $state('salary');
  let chartSegment = $state('全区分');

  let activeView = $state('chart');
  let employeeCondition = $state('100人以上');
  let rankingOrder = $state('top');

  let rankings = $derived(
    createRankings(companies, employeeCondition, rankingOrder)
  );
</script>

<svelte:head>
  <title>2026年 年間平均給与ランキング</title>
  <meta
    name="description"
    content="2026年提出の有価証券報告書に基づく年間平均給与ランキング"
  />
</svelte:head>

<header>
  <div class="container">
    <p class="eyebrow">EDINET DATA PROJECT / 2026</p>
    <h1>年間平均給与ランキング</h1>
    <p class="subtitle">
      2026年提出の有価証券報告書に基づく、企業別の年間平均給与。
      全産業および業種別のランキングを一覧で比較できます。
      上位・下位のランキングや従業員数の条件を切り替えることもできます。
    </p>
  </div>
</header>


<main class="container">
  <nav class="view-tabs" aria-label="表示の切り替え">
    <button
      class:active={activeView === 'chart' && chartMode === 'salary'}
      onclick={() => {activeView = 'chart';chartMode = 'salary';}}
    >
      チャート（実額・万円）
    </button>
    <button
      class:active={activeView === 'chart' && chartMode === 'index'}
      onclick={() => {activeView = 'chart';chartMode = 'index';}}
    >
      チャート（指数、2020年＝100）
    </button>

    <button
      class:active={activeView === 'ranking'}
      aria-pressed={activeView === 'ranking'}
      onclick={() => activeView = 'ranking'}
    >
      ランキング
    </button>

    <button
    class:active={activeView === 'scatter'}
    onclick={() => {
      activeView = 'scatter';
      chartEmployeeCondition = '200人以上';
    }}
>
  散布図（利益と給与）
</button>
  </nav>


  {#if activeView === 'chart'}

    <div class="chart-controls">
      <div class="chart-filter">
        <label for="chart-employees">2026年時点の従業員数</label>
        <select id="chart-employees" bind:value={chartEmployeeCondition}>
          <option value="制限なし">制限なし</option>
          {#each [100, 200, 300, 400, 500] as n}
            <option value={`${n}人以上`}>{n}人以上</option>
          {/each}
        </select>
      </div>

      <div class="chart-filter">
        <label for="chart-segment">上場区分</label>
        <select id="chart-segment" bind:value={chartSegment}>
          <option value="全区分">全区分</option>
          <option value="プライム">プライム</option>
          <option value="スタンダード">スタンダード</option>
          <option value="グロース">グロース</option>
        </select>
      </div>
    </div>

    <div class="chart-grid">
      {#each chartSectors as sector (sector)}
        <RangeChart
          companies={chartCompanies}
          {sector}
          employeeCondition={chartEmployeeCondition}
          segment={chartSegment}
          mode={chartMode}
        />
      {/each}
    </div>


  {:else if activeView === 'scatter'}


  <div class="scatter-description">
    <h2>散布図について</h2>

    <ol>
      <li>横軸：2020～2026年の純利益成長率（％）</li>
      <li>縦軸：同期間の年間平均給与上昇率（％）</li>
      <li>
        対象：2020年・2026年ともに純利益が黒字で、
        2020～2026年の純利益・給与・従業員数がすべて揃う企業
      </li>
      <li>従業員数：2026年時点で200人以上を初期設定</li>
    </ol>
  </div>


    <div class="chart-controls">
      <div class="chart-filter">
        <label for="scatter-employees">2026年時点の従業員数</label>
        <select
          id="scatter-employees"
          bind:value={chartEmployeeCondition}
        >
          <option value="制限なし">制限なし</option>
          {#each [100, 200, 300, 400, 500] as n}
            <option value={`${n}人以上`}>{n}人以上</option>
          {/each}
        </select>
      </div>

      <div class="chart-filter">
        <label for="scatter-segment">上場区分</label>
        <select id="scatter-segment" bind:value={chartSegment}>
          <option value="全区分">全区分</option>
          <option value="プライム">プライム</option>
          <option value="スタンダード">スタンダード</option>
          <option value="グロース">グロース</option>
        </select>
      </div>
    </div>

    <div class="chart-grid">
      {#each chartSectors as sector (sector)}
        <ScatterChart
          companies={chartCompanies}
          {sector}
          employeeCondition={chartEmployeeCondition}
          segment={chartSegment}
        />
      {/each}
    </div>


  {:else if activeView === 'ranking'}
    <EmployeeFilter
      bind:value={employeeCondition}
      bind:rankingOrder
    />

    <div class="ranking-grid">
      {#each rankings as group (group.sector)}
        <RankingCard {group} />
      {/each}
    </div>
  {/if}


  <footer>
    出典：EDINET 有価証券報告書（2020〜2026年提出）
    <p>※表示内容は開発中です。</p>
  </footer>
</main>

<style>
  .chart-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 1500px) {
    .chart-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 1200px) {
    .chart-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .chart-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .chart-grid {
      grid-template-columns: 1fr;
    }
  }

  .chart-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }

  .chart-filter {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chart-filter label {
    font-size: 13px;
    font-weight: 700;
  }

  .chart-filter select {
    width: 260px;
    max-width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: white;
    font-size: 14px;
  }
</style>
