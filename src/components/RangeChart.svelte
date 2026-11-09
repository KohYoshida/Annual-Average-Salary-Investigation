
<script>
  import { scaleLinear, scalePoint, area, line, extent, mean } from 'd3';

  let {companies = [],sector = '全産業',employeeCondition = '100人以上',segment = '全区分',mode = "salary"} = $props();
  let hoveredYear = $state(null);
  let metric = $derived(mode === 'index' ? 'salaryIndex' : 'salary');

  const years = Array.from({ length: 7 }, (_, i) => 2020 + i);

  const width = 760;
  const height = 380;
  const margin = { top: 25, right: 25, bottom: 45, left: 85 };

  // 7年間の給与が揃っている企業だけを対象にする

  let eligible = $derived(
    companies.filter(d => {
      // 業種による絞り込み
      if (sector !== '全産業' && d.sector !== sector) {
        return false;
      }

      // 7年間の給与が揃っている企業
      if (d.complete[metric] !== true) {
        return false;
      }

      // 上場区分による絞り込み
      if (segment !== '全区分' && d.segment !== segment) {
        return false;
      }

      // 従業員数による絞り込み
      if (employeeCondition === '制限なし') {
        return true;
      }

      const employees2026 = d.data['2026']?.employees;
      const minimum = parseInt(employeeCondition, 10);

      return employees2026 != null && employees2026 >= minimum;
    })
  );
    
    let axisEligible = $derived(
    companies.filter(d => {
        // 業種は現在のパネルと同じ
        if (sector !== '全産業' && d.sector !== sector) {
        return false;
        }

        // 上場区分は絞り込まない
        if (d.complete[metric] !== true) return false;

        // 従業員数の条件は維持
        if (employeeCondition === '制限なし') return true;

        const employees2026 = d.data['2026']?.employees;
        const minimum = parseInt(employeeCondition, 10);

        return employees2026 != null && employees2026 >= minimum;
    })
    );


    // 年ごとの最小値・最大値・算術平均値
    let stats = $derived(
    years.map(year => {
      const values = eligible.map(d => d.data[String(year)][metric]);
      return {
        year,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: mean(values)
      };
      })
    );

  let x = $derived(
    scalePoint()
      .domain(years)
      .range([margin.left, width - margin.right])
  );


    let y = $derived.by(() => {
    const values = axisEligible.flatMap(d =>
        years.map(year => d.data[String(year)][metric])
    );

    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);

    return scaleLinear()
        .domain([min, max])
        .nice()
        .range([height - margin.bottom, margin.top]);
    });


  let areaPath = $derived(
    area()
      .x(d => x(d.year))
      .y0(d => y(d.min))
      .y1(d => y(d.max))(stats)
  );

  let meanPath = $derived(
    line()
      .x(d => x(d.year))
      .y(d => y(d.avg))(stats)
  );

  let yTicks = $derived(y.ticks(5));

  $effect(() => {
    console.table(
        stats.map(d => ({
        year: d.year,
        min: Math.round(d.min),
        avg: Math.round(d.avg),
        max: Math.round(d.max)
        }))
    );
  });
</script>

<div class="chart-container">
  <h2>{sector}</h2>

  <p>対象企業：{eligible.length.toLocaleString('ja-JP')}社</p>

    {#if eligible.length > 0}
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="年間平均給与の最小値、最大値、平均値の推移">
                {#each yTicks as tick}
                <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="#e5e7eb"
                />
                <text
                    x={margin.left - 12}
                    y={y(tick) + 4}
                    text-anchor="end"
                    font-size="24"
                    fill="#64748b"
                >
                    {mode === 'index' ? tick.toFixed(0) : `${(tick / 10000).toLocaleString('ja-JP')}`}
                </text>
                {/each}

                <path d={areaPath} fill="#9ca3af" opacity="0.45" />

                <path
                d={meanPath}
                fill="none"
                stroke="#dc2626"
                stroke-width="3"
                />

                {#each stats as d}

            <circle
                cx={x(d.year)}
                cy={y(d.avg)}
                r="50"
                fill="transparent"
                role="img"
                aria-label={mode === 'index' ? `平均 ${d.avg.toFixed(1)}` : `平均 ${Math.round(d.avg / 10000).toLocaleString('ja-JP')}万円`}
                onpointerenter={() => hoveredYear = d.year}
                onpointerleave={() => hoveredYear = null}
            />

            {#if hoveredYear === d.year}
                <circle
                cx={x(d.year)}
                cy={y(d.avg)}
                r="3￥0"
                fill="#dc2626"
                stroke="white"
                stroke-width="2"
                pointer-events="none"
                />

                <g
                transform={`translate(${Math.max(80, Math.min(width - 80, x(d.year)))}, ${y(d.avg) - 45})`}
                pointer-events="none"
                >
                <rect
                    x="-150"
                    y="-56"
                    width="300"
                    height="96"
                    rx="6"
                    fill="#1e293b"
                />

                <text
                    x="0"
                    y="-18"
                    text-anchor="middle"
                    fill="white"
                    font-size="24"
                >
                    {d.year}年
                </text>

                <text
                    x="0"
                    y="18"
                    text-anchor="middle"
                    fill="white"
                    font-size="26"
                    font-weight="bold"
                >
                    {mode === 'index' ? `平均 ${d.avg.toFixed(1)}` : `平均 ${Math.round(d.avg / 10000).toLocaleString('ja-JP')}万円`}
                </text>
                </g>
            {/if}
            {/each}

            {#each years as year}
            <text
                x={x(year)}
                y={height - margin.bottom + 25}
                text-anchor="middle"
                font-size="24"
                fill="#475569"
            >
                {year}
            </text>
            {/each}
        </svg>
    {:else}
    <p>表示できる企業がありません。</p>
  {/if}

  <!-- <div class="legend">
    <span><i class="range"></i> 最小値〜最大値</span>
    <span><i class="average"></i> 平均値</span>
  </div> -->
</div>

<style>
  .chart-container {
    background: white;
    border: 1px solid #dce5ed;
    border-radius: 10px;
    padding: 24px;
  }

  h2 {
    font-size: 20px;
    margin: 0 0 8px;
  }

  p {
    font-size: 13px;
    color: #64748b;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .legend {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-top: 12px;
    font-size: 13px;
  }

  .legend span {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend i {
    display: inline-block;
    width: 20px;
  }

  .range {
    height: 12px;
    background: #9ca3af;
    opacity: 0.6;
  }

  .average {
    height: 3px;
    background: #dc2626;
  }
</style>
