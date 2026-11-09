
<script>
  import { scaleLinear, scaleSymlog, extent } from 'd3';

  let {
    companies = [],
    sector = '全産業',
    employeeCondition = '200人以上',
    segment = '全区分'
  } = $props();

  let hoveredCode = $state(null);

  const years = Array.from({ length: 7 }, (_, i) => String(2020 + i));

  const width = 760;
  const height = 440;
  const margin = { top: 30, right: 35, bottom: 75, left: 90 };

  // 利益・給与・従業員数が7年間すべて揃っているか
  function isComplete(d) {
    return ['profit', 'salary', 'employees'].every(metric =>
      years.every(year =>
        Number.isFinite(d.data?.[year]?.[metric])
      )
    );
  }

  // 散布図に必要な条件を満たす企業を抽出し、成長率を計算
  let baseCompanies = $derived(
    companies
      .filter(d => {
        if (sector !== '全産業' && d.sector !== sector) {
          return false;
        }

        if (!isComplete(d)) return false;

        if (d.data['2020'].profit <= 0) return false;
        if (d.data['2026'].profit <= 0) return false;
        if (d.data['2020'].salary <= 0) return false;

        if (employeeCondition !== '制限なし') {
          const minimum = parseInt(employeeCondition, 10);
          if (d.data['2026'].employees < minimum) return false;
        }

        return true;
      })
      .map(d => ({
        ...d,
        profitGrowth:
          (d.data['2026'].profit / d.data['2020'].profit - 1) * 100,
        salaryGrowth:
          (d.data['2026'].salary / d.data['2020'].salary - 1) * 100
      }))
      .filter(d =>
        Number.isFinite(d.profitGrowth) &&
        Number.isFinite(d.salaryGrowth)
      )
  );

  // 上場区分を反映した表示企業
  let eligible = $derived(
    baseCompanies.filter(d =>
      segment === '全区分' || d.segment === segment
    )
  );

  // 軸は上場区分に依存させない
  let xDomain = $derived(
    extent(baseCompanies, d => d.profitGrowth)
  );

  let yDomain = $derived(
    extent(baseCompanies, d => d.salaryGrowth)
  );

  // マイナスの成長率にも対応する対称対数軸
  let x = $derived(
    scaleSymlog()
      .constant(100)
      .domain([
        Math.min(0, xDomain[0] ?? 0),
        Math.max(1, xDomain[1] ?? 1)
      ])
      .nice()
      .range([margin.left, width - margin.right])
  );

  let y = $derived(
    scaleLinear()
      .domain([
        Math.min(0, yDomain[0] ?? 0),
        Math.max(1, yDomain[1] ?? 1)
      ])
      .nice()
      .range([height - margin.bottom, margin.top])
  );

  let xTicks = $derived(x.ticks(5));
  let yTicks = $derived(y.ticks(5));

  let hoveredCompany = $derived(
    eligible.find(d => d.edinetCode === hoveredCode)
  );

  const formatPercent = value =>
    `${value > 0 ? '+' : ''}${value.toLocaleString('ja-JP', {
      maximumFractionDigits: 1
    })}%`;

  const formatTick = value =>
    value.toLocaleString('ja-JP', {
      maximumFractionDigits: 0
    });
</script>

<div class="chart-container">
  <h2>{sector}</h2>
  <p>対象企業：{eligible.length.toLocaleString('ja-JP')}社</p>

  {#if baseCompanies.length > 0}
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${sector}の純利益成長率と給与上昇率の散布図`}
    >
      <!-- 横方向の補助線 -->
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
          y={y(tick) + 5}
          text-anchor="end"
          font-size="19"
          fill="#64748b"
        >
          {formatTick(tick)}
        </text>
      {/each}

      <!-- 縦方向の補助線 -->
      {#each xTicks as tick}
        <line
          x1={x(tick)}
          x2={x(tick)}
          y1={margin.top}
          y2={height - margin.bottom}
          stroke="#e5e7eb"
        />
        <text
          x={x(tick)}
          y={height - margin.bottom + 26}
          text-anchor="middle"
          font-size="18"
          fill="#64748b"
        >
          {formatTick(tick)}
        </text>
      {/each}

      <!-- 成長率0%の基準線 -->
      <line
        x1={x(0)}
        x2={x(0)}
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="#64748b"
        stroke-width="1.5"
        stroke-dasharray="5 4"
      />

      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={y(0)}
        y2={y(0)}
        stroke="#64748b"
        stroke-width="1.5"
        stroke-dasharray="5 4"
      />

      <!-- 各企業の点 -->
      {#each eligible as d (d.edinetCode)}
        <circle
          cx={x(d.profitGrowth)}
          cy={y(d.salaryGrowth)}
          r={hoveredCode === d.edinetCode ? 7 : 4}
          fill="#2563eb"
          fill-opacity={hoveredCode === d.edinetCode ? 1 : 0.45}
          stroke={hoveredCode === d.edinetCode ? '#1e40af' : 'none'}
          stroke-width="2"
          onpointerenter={() => hoveredCode = d.edinetCode}
          onpointerleave={() => hoveredCode = null}
        />
      {/each}

      <!-- 軸ラベル -->
      <text
        x={margin.left + (width - margin.left - margin.right) / 2}
        y={height - 15}
        text-anchor="middle"
        font-size="21"
        fill="#334155"
      >
        純利益成長率（％）
      </text>

      <text
        transform={`translate(25, ${height / 2}) rotate(-90)`}
        text-anchor="middle"
        font-size="21"
        fill="#334155"
      >
        年間平均給与上昇率（％）
      </text>

      <!-- ホバーした企業の情報 -->
      {#if hoveredCompany}
        {@const tooltipX = Math.max(
          margin.left + 150,
          Math.min(width - margin.right - 150,
            x(hoveredCompany.profitGrowth))
        )}
        {@const tooltipY = Math.max(
          115,
          y(hoveredCompany.salaryGrowth) - 20
        )}

        <g
          transform={`translate(${tooltipX}, ${tooltipY})`}
          pointer-events="none"
        >
          <rect
            x="-150"
            y="-108"
            width="300"
            height="100"
            rx="7"
            fill="#1e293b"
          />
          <text
            x="0"
            y="-79"
            text-anchor="middle"
            fill="white"
            font-size="18"
            font-weight="bold"
          >
            {hoveredCompany.name}
          </text>
          <text
            x="0"
            y="-48"
            text-anchor="middle"
            fill="white"
            font-size="18"
          >
            利益：{formatPercent(hoveredCompany.profitGrowth)}
          </text>
          <text
            x="0"
            y="-21"
            text-anchor="middle"
            fill="white"
            font-size="18"
          >
            給与：{formatPercent(hoveredCompany.salaryGrowth)}
          </text>
        </g>
      {/if}
    </svg>
  {:else}
    <p>表示できる企業がありません。</p>
  {/if}

  <p class="note">横軸：対称対数スケール（目盛り間隔は均等ではありません）</p>
</div>

<style>
  .chart-container {
    background: white;
    border: 1px solid #dce5ed;
    border-radius: 10px;
    padding: 24px;
    min-width: 0;
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
    overflow: visible;
  }

  .note {
    font-size: 11px;
    margin-top: 8px;
  }
</style>
